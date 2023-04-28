<?php
$raw_githubusercontent_com = 'https://raw.githubusercontent.com';
// $raw_githubusercontent_com = 'https://rawgithubusercontent.deno.dev';  // FIXME: fixes a strange problem on infomaniak servers

function simulation_check_url($url) {
  if (substr($url, 0, 19) !== 'https://github.com/')
    return "The URL should start with 'https://github.com/'";
  if (substr($url, -4) != '.wbt')
    return "The URL should end with '.wbt': " . substr($url, -4);
  return check_url($url);
}

function proto_check_url($url) {
  if (substr($url, 0, 19) !== 'https://github.com/')
    return "The URL should start with 'https://github.com/'";
  if (substr($url, -6) != '.proto')
    return "The URL should end with '.proto': " . substr($url, -6);
  return check_url($url, true);
}

function check_url($url, $proto = false) {
  $exploded = explode('/', substr($url, 19));
  $count = count($exploded);
  if ($count < 6)
    return 'Wrong Webots URL';
  $username = $exploded[0];
  $repository = $exploded[1];
  if (!preg_match('/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i', $username))
    return 'Wrong GitHub username';
  if (!preg_match('/^[a-z\d_.-]{1,100}$/i', $repository))
    return 'Wrong GitHub repository';
  if ($exploded[2] != 'blob' && $exploded[2] != 'raw')
    return 'Missing \'/blob/\' or \'/raw/\' in URL';
  $tag_or_branch = $exploded[3];
  if (!preg_match('/^[a-z\d_.-]{0,100}$/i', $tag_or_branch))
    return 'Wrong GitHub tag or branch name';
  $folder = implode('/', array_slice($exploded, 4, $count - 5));
  if ($folder !=='' and
      (!preg_match('/^[-a-z\d_.-\/]{1,100}$/i', $folder)  # no fancy folder name
       or substr($folder, 0, 1) === '/'                   # doesn't start with slash
       or strstr($folder, '//')                           # no double slashes
       or substr($folder, -1) === '/'))                   # doesn't end with slash
    return 'Wrong folder name';
  if ($folder !== '')
    $folder = "/$folder/";

  $world_or_proto = $exploded[$count - 1];

  return array($username, $repository, $tag_or_branch, $folder, $world_or_proto);
}

function yaml_error($msg) {
  return "YAML file error: $msg";
}

function github_check_yaml($check_url, $proto) {
  global $raw_githubusercontent_com;
  # yaml error return

  # get file from github
  list($username, $repository, $version, $folder, $world_or_proto) = $check_url;
  $index = strpos($folder, "/protos/");
  if (!$index)
    $index = strpos($folder, "/worlds/");
  $yaml_folder = substr($folder, 0, $index);
  $yaml_url = "$raw_githubusercontent_com/$username/$repository/$version$yaml_folder/webots.yaml";
  $yaml_content = @file_get_contents($yaml_url);
  if ($yaml_content === false) {
    $yaml_url = "$raw_githubusercontent_com/$username/$repository/$version$yaml_folder/webots.yml";
    $yaml_content = @file_get_contents($yaml_url);
    if ($yaml_content === false)
      return yaml_error("webots.yaml file not found.");
  }

  # yaml file variables
  $publish = 'true (default)';
  $type = '';
  $competition = '';

  # delete empty lines
  $yaml_content = preg_replace("/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/", "\n", $yaml_content);
  # parse yaml file
  $line = strtok($yaml_content, "\r\n");
  while ($line !== false) {
    if (substr($line, 0, 8) === 'publish:')
      $publish = trim(substr($line, 8), " ");
    elseif (substr($line, 0, 5) === 'type:')
      $type = trim(substr($line, 5), " ");
    elseif (substr($line, 0, 12) === 'competition:')
      $competition = trim(substr($line, 12), " ");
    $line = strtok("\r\n");
  }

  # check if configuration makes sense
  if ($publish === 'false')
    return "Project removed because 'publish' is set to false in webots.yaml. To allow the project to be published, set it to true.";
  elseif ($type === '' && $proto === false)
    return yaml_error("type not defined.");

  # return array with YAML file info
  return array($type, $competition);
}
?>
