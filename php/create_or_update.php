<?php # This script initializes a new proto
# exit and error message
function error($message) {
  global $continue_on_error;
  if (!$continue_on_error)
    die("{\"error\":\"$message\"}");
}

function create_or_update_proto($url, $id, $search) {
  global $raw_githubusercontent_com;
  global $database_host;
  global $database_username;
  global $database_password;
  global $database_name;
  global $github_oauth_client_id;
  global $github_oauth_client_secret;

  $mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
  if ($mysqli->connect_errno)
    error("Can't connect to MySQL database: $mysqli->connect_error");
  $mysqli->set_charset('utf8');
  $url = $mysqli->escape_string($url);

  # check content
  $check_url = proto_check_url($url);
  if (!is_array($check_url))
    error($check_url);
  list($username, $repository, $tag_or_branch, $folder, $proto) = $check_url;
  $proto_url = "$raw_githubusercontent_com/$username/$repository/$tag_or_branch$folder$proto";
  $proto_content = @file_get_contents($proto_url);
  if ($proto_content === false) {
    if ($id != 0) {
      $query = "SELECT * FROM proto WHERE id=$id";
      $result = $mysqli->query($query) or error($mysqli->error);
      $row = $result->fetch_array(MYSQLI_ASSOC);
      $number_of_failures = $row['number_of_failures'];
      $last_failure = $row["last_failure"];
      $today = date('Y-m-d', time());
      $today_dt = new DateTime($today);
      $expire_dt = new DateTime($last_failure);
      if ($number_of_failures >= 10) {
        $query = "DELETE FROM proto WHERE id=$id";
        $mysqli->query($query) or error($mysqli->error);
        if ($mysqli->affected_rows === 0)
          error("Failed to delete proto with proto file '$proto'");
        error("Failed to fetch proto file $proto, it has been deleted.");
      } else if ($today_dt > $expire_dt){
        $number_of_failures++;
        $query = "UPDATE proto SET number_of_failures=$number_of_failures, last_failure=NOW() WHERE id=$id";
        $mysqli->query($query) or error($mysqli->error);
      }
    }
    error("Failed to fetch proto file $proto.");
  }

  # check and retrieve information from webots.yaml file
  $check_yaml = github_check_yaml($check_url, true);
  if (!is_array($check_yaml)) {
    $query = "DELETE FROM proto WHERE id=$id";
    $mysqli->query($query) or error($mysqli->error);
    error($check_yaml);
  }

  # retrieve the title and infos from the header.
  $info = false;
  $title = '';
  $description = '';
  $license = '';
  $license_url = '';
  $keywords = '';
  $line = strtok($proto_content, "\r\n");
  $version = $mysqli->escape_string(substr($line, 10, 6)); // "#VRML_SIM R2022b utf8" -> "R2022b"
  if (!str_starts_with($version, "R20"))
    error("This proto is missing a version header or has an incorrect one.");
  $line = strtok("\r\n");
  $externprotos = [];
  $no_3d_view = false;
  while ($line !== false) {
    $line == trim($line);
    if ($line[0] === '#') {
      $line = trim(str_replace('#', '', $line));
      if (strtolower(substr($line, 0, 8)) !== 'template' && strtolower(substr($line, 0, 17)) !== 'documentation url' && substr($line, 0, 4) !== 'VRML') {
        if(strtolower(substr($line, 0, 4)) === 'tags') {
          if (strpos($line, 'deprecated') || strpos($line, 'hidden'))
            error("This proto is either deprecated or hidden and should not be added.");
          elseif (strpos($line, 'no3dView'))
            $no_3d_view = true;
        } elseif (strtolower(substr($line, 0, 9)) === 'keywords:') {
          $keywords = str_replace('keywords:', '', $line);
          $keywords = explode(',', $keywords);
          $kk = array();
          foreach ($keywords as $key) {
            $key = explode('/', $key);
            foreach ($key as &$tag)
              $tag = trim($mysqli->escape_string($tag));
            array_push($kk, $key);
          }
          $keywords = $kk;
        } elseif (strtolower(substr($line, 0, 11)) === 'license url')
          $license_url = trim(preg_replace("/license url\s*:/", '', $line));
        elseif (strtolower(substr($line, 0, 7)) === 'license')
          $license = trim(preg_replace("/license\s*:/", '', $line));
        else {
          if ($description !== '')
            $description .= "\n";
          $description .= $mysqli->escape_string($line);
        }
      }
    } elseif (substr($line, 0, 11) === 'EXTERNPROTO') {
      $proto_url = trim(str_replace('"', '',str_replace('EXTERNPROTO', '', $line)));
      $proto_name = str_replace('.proto', '', $proto_url);
      if (strrpos($proto_name, '/'))
        $proto_name = substr($proto_name, strrpos($proto_name, '/') + 1);
      array_push($externprotos, [$proto_name, $proto_url]);
    } elseif (substr($line, 0, 6) === 'PROTO ')
      $title = trim(substr($line, 6));
    if (!empty($title) && $title[-1] === '[')
      $title = trim(substr($title, 0, -1));
    $line = strtok("\r\n");
  }

  $original_externprotos = $externprotos;
  $title = $mysqli->escape_string($title);
  $license = $mysqli->escape_string($license);
  $license_url = $mysqli->escape_string($license_url);

  $base_type = '';
  preg_match("/(?:\]\s*)\{\s*(?:\%\<[\s\S]*?(?:\>\%\s*))?(?:DEF\s+[^\s]+)?\s+([a-zA-Z0-9\_\-\+]+)\s*\{/", $proto_content, $match);
  if ($match)
    $base_type = $match[1];
  $base_proto = $base_type;
  $base_nodes = ['Gyro', 'DistanceSensor', 'Recognition', 'TouchSensor', 'ContactProperties', 'TextureCoordinate', 'Color',
    'Camera', 'Accelerometer', 'Slot', 'Radar', 'Transform', 'Zoom', 'RangeFinder', 'PointSet', 'Capsule', 'Speaker', 'Lens',
    'Viewpoint', 'IndexedFaceSet', 'Solid', 'Group', 'Muscle', 'Lidar', 'InertialUnit', 'DirectionalLight',
    'HingeJointParameters', 'Compass', 'Normal', 'Propeller', 'Physics', 'RotationalMotor', 'Microphone', 'ImageTexture', 'Fog',
    'Mesh', 'Track', 'Background', 'LED', 'Material', 'Box', 'PointLight', 'Cylinder', 'Damping', 'GPS', 'Radio', 'Pen', 'Cone',
    'WorldInfo', 'SpotLight', 'TextureTransform', 'LinearMotor', 'Receiver', 'Coordinate', 'Hinge2JointParameters', 'CadShape',
    'LensFlare', 'TrackWheel', 'PBRAppearance', 'Shape', 'Altimeter', 'PositionSensor', 'Connector', 'HingeJoint', 'Plane',
    'Brake', 'Appearance', 'ElevationGrid', 'BallJointParameters', 'Fluid', 'Robot', 'SolidReference', 'Sphere', 'Skin',
    'IndexedLineSet', 'ImmersionProperties', 'JointParameters', 'Focus', 'SliderJoint', 'Emitter', 'Hinge2Joint', 'BallJoint',
    'LightSensor', 'Display', 'Billboard', 'Charger', 'Pose', 'VacuumGripper'];

  # search for the base type
  $parent_url = $url;
  while(!in_array($base_type, $base_nodes)) {
    $results = get_parent($externprotos, $base_type, $parent_url);
    $externprotos = $results[0];
    $base_type = $results[1];
    $parent_url = $results[3];
    $found_parent = $results[4];
    if(!$found_parent) {
      error("Base type: seems like the parent node is missing from the EXTERNPROTO.");
      return;
    }
  }

  $device_regex = "/(\s+Brake\s*|\s+LinearMotor\s*|\s+PositionSensor\s*|\s+RotationalMotor\s*|\s+Skin\s*|\s+Accelerometer\s*|\s+Altimeter\s*|\s+Camera\s*|\s+Compass\s*|\s+Compass\s*|\s+Display\s*|\s+DistanceSensor\s*|\s+Emitter\s*|\s+GPS\s*|\s+Gyro\s*|\s+InertialUnit\s*|\s+LED\s*|\s+Lidar\s*|\s+LightSensor\s*|\s+Pen\s*|\s+Radar\s*|\s+RangeFinder\s*|\s+Receiver\s*|\s+Speaker\s*|\s+TouchSensor\s*|\s+Track\s*|\s+VacuumGripper\s*)/";
  $needs_robot_ancestor = 0;
  if (in_array($base_type, ['Solid', 'Pose', 'Group']))
    $needs_robot_ancestor = preg_match($device_regex, $proto_content);

  $slot_type = '';
  if ($base_type === "Slot") {
    $found = false;
    $current_proto_content = $proto_content;
    $externprotos = $original_externprotos;
    $parent_url = $url;
    while(!$found) {
      preg_match("/type\s+\"([a-zA-Z0-9\_\-\+\s]+)\"/", $current_proto_content, $match);
      if ($match) {
        $slot_type = $match[1];
        $found = true;
      } else {
        $results = get_parent($externprotos, $base_proto, $parent_url);
        $externprotos = $results[0];
        $base_proto = $results[1];
        $current_proto_content = $results[2];
        $parent_url = $results[3];
        $found_parent = $results[4];
        if(!$found_parent)
          error("Slot type: seems like the parent node is missing from the EXTERNPROTO.");
      }
    }
  }

  $auth = "Authorization: Basic " . base64_encode("$github_oauth_client_id:$github_oauth_client_secret");
  $context = stream_context_create(['http' => ['method' => 'GET', 'header' => ['User-Agent: PHP', $auth]]]);
  $info_json = @file_get_contents("https://api.github.com/repos/$username/$repository", false, $context);
  $info = json_decode($info_json);
  $stars = intval($info->{'stargazers_count'});
  $competitors = 0;
  $query = "SELECT viewed FROM proto WHERE url=\"$url\" AND id=$id";
  $result = $mysqli->query($query) or error($mysqli->error);
  $row = $result->fetch_array(MYSQLI_ASSOC);
  $viewed = ($result && $row) ? $row['viewed'] : 0;
  $branch = basename(dirname(__FILE__, 2));
  if ($id === 0)
    $query = "INSERT IGNORE INTO proto(url, viewed, stars, title, description, version, branch, license_url, license, "
            ."base_type, needs_robot_ancestor, slot_type, no_3d_view) "
            ."VALUES(\"$url\", $viewed, $stars, \"$title\", \"$description\", \"$version\", \"$branch\", \"$license_url\", "
            ."\"$license\", \"$base_type\", \"$needs_robot_ancestor\", \"$slot_type\", \"$no_3d_view\")";
  else
    $query = "UPDATE proto SET viewed=$viewed, stars=$stars, title=\"$title\", description=\"$description\", "
            ."version=\"$version\", updated=NOW(), license_url=\"$license_url\", license=\"$license\", "
            ."base_type=\"$base_type\", needs_robot_ancestor=\"$needs_robot_ancestor\", slot_type=\"$slot_type\", no_3d_view=\"$no_3d_view\", number_of_failures=0, last_failure=0000-00-00 "
            ."WHERE url=\"$url\" AND id=$id";
  $mysqli->query($query) or error($mysqli->error);
  if ($mysqli->affected_rows != 1) {
    if ($id === 0)
      error("This proto already exists");
    else
      error("Failed to update the proto");
  }

  $remove_old_keywords = false;
  if ($id !== 0)
    $remove_old_keywords = true;
  $id = ($id === 0) ? $mysqli->insert_id : $id;

  if ($remove_old_keywords)
    $query = $mysqli->query("DELETE FROM proto_keywordmap WHERE proto_id = $id");

  if (is_array($keywords)) {
    foreach ($keywords as $key) {
      if (count($key) === 2) {
        $query = "INSERT INTO proto_keywordmap (proto_id, keyword_id) SELECT $id, keyword_id FROM (SELECT keyword.keyword_id, keyword.name AS name, "
                ."parent.name AS parentName FROM proto_keyword AS keyword LEFT JOIN proto_keyword AS parent ON keyword.parent_id=parent.keyword_id)"
                ." AS joinTable WHERE name='$key[1]' AND parentName='$key[0]'";
      } else
        $query = "INSERT INTO proto_keywordmap (proto_id, keyword_id) SELECT $id, keyword_id FROM proto_keyword WHERE name='$key[0]'";

      $mysqli->query($query) or error($mysqli->error);
    }
  }

  # return answer
  $condition = "branch=\"$branch\"";
  if ($search != "")
    $condition .= " AND LOWER(title) LIKE LOWER('%$search%')";

  $result = $mysqli->query("SELECT COUNT(*) AS count FROM proto WHERE $condition") or error($mysqli->error);
  $count = $result->fetch_array(MYSQLI_ASSOC);
  $total = intval($count['count']);

  $answer = array();
  $answer['id'] = $id;
  $answer['url'] = $url;
  $answer['viewed'] = $viewed;
  $answer['stars'] = $stars;
  $answer['title'] = $title;
  $answer['description'] = $description;
  $answer['version'] = $version;
  $answer['updated'] = date("Y-m-d H:i:s");
  $answer['total'] = $total;
  return $answer;
}

function get_parent($externprotos, $base_proto, $parent_url) {
  global $raw_githubusercontent_com;
  $found_parent = false;
  $current_proto_content = false;
  for($i = 0; $i < count($externprotos); $i++) {
    if ($externprotos[$i][0] === $base_proto) {
      $found_parent = true;
      $extern_url = $externprotos[$i][1];
      if (str_starts_with($extern_url, "webots://"))
        $extern_url = str_replace("webots://", "https://github.com/cyberbotics/webots/blob/released/", $extern_url);
      else if (!str_starts_with($extern_url, "https"))
        $extern_url = substr($parent_url, 0, strrpos($parent_url, '/') + 1).$extern_url;
      $parent_url = $extern_url;
      $check_url = proto_check_url($extern_url);
      if (!is_array($check_url))
        error($check_url);
      list($extern_username, $extern_repository, $extern_tag_or_branch, $extern_folder, $extern_proto) = $check_url;
      $extern_proto_url = "$raw_githubusercontent_com/$extern_username/$extern_repository/$extern_tag_or_branch$extern_folder$extern_proto";
      $extern_proto_content = @file_get_contents($extern_proto_url);
      if ($extern_proto_content === false)
        error("Could not retrieve parent proto with url'$extern_url'");
      $current_proto_content = $extern_proto_content;

      $line = strtok($extern_proto_content, "\r\n");
      $line = strtok("\r\n");
      $externprotos = [];
      while ($line !== false) {
        $line == trim($line);
        if (substr($line, 0, 11) === 'EXTERNPROTO') {
          $proto_url = trim(str_replace('"', '',str_replace('EXTERNPROTO', '', $line)));
          $proto_name = str_replace('.proto', '', $proto_url);
          if (strrpos($proto_name, '/'))
            $proto_name = substr($proto_name, strrpos($proto_name, '/') + 1);
          array_push($externprotos, [$proto_name, $proto_url]);
        }
        $line = strtok("\r\n");
      }

      preg_match("/(?:\]\s*)\{\s*(?:\%\<[\s\S]*?(?:\>\%\s*))?(?:DEF\s+[^\s]+)?\s+([a-zA-Z0-9\_\-\+]+)\s*\{/",
        $extern_proto_content, $match);
      if ($match)
        $base_proto = $match[1];

      break;
    }
  }
  if (!$found_parent) {
    $str = '';
    for($i = 0; $i < count($externprotos); $i++)
      $str .= $externprotos[$i][0];
    error(" $str base: $base_proto parent_url: $parent_url");
  }
  return array($externprotos, $base_proto, $current_proto_content, $parent_url, $found_parent);
}
?>
