<?php
function simulation_check_url($url) {
  if (substr($url, 0, 19) !== 'https://github.com/')
    return "The URL should start with 'https://github.com/'";
  if (substr($url, -4) != '.wbt')
    return "The URL should end with '.wbt': " . substr($url, -4);
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
  $version = $exploded[3];
  if (!preg_match('/^[a-z\d_.-]{0,100}$/i', $version))
    return 'Wrong GitHub tag or branch name';
  $folder = implode('/', array_slice($exploded, 4, $count - 6));
  if ($folder !=='' and
      (!preg_match('/^[a-z\d_.-\/]{1,100}$/i', $folder)  # no fancy folder name
      or substr($folder, 0, 1) === '/'                  # doesn't start with slash
      or strstr($folder, '//')                          # no double slashes
      or substr($folder, -1) === '/'))                  # doesn't end with slash
    return 'Wrong folder name';
  if ($folder !== '')
    $folder = "/$folder";
  $worlds_folder = $exploded[$count - 2];
  if ($worlds_folder != 'worlds')
    return 'Missing \'/worlds/\' folder in URL';
  $world = $exploded[$count - 1];
  return array($username, $repository, $version, $folder, $world);
}

function simulation_check_yaml($check_url) {
  # yaml error return
  function yaml_error($msg) {
    return "YAML file error: $msg<br><br>For information on publishing with webots.yaml visit hello.com";
  }

  # get file from github
  list($username, $repository, $version, $folder, $world) = $check_url;
  $yaml_url = "https://raw.githubusercontent.com/$username/$repository/$version$folder/webots.yaml";
  $yaml_content = @file_get_contents($yaml_url);
  if ($yaml_content === false) {
    $yaml_url = "https://raw.githubusercontent.com/$username/$repository/$version$folder/webots.yml";
    $yaml_content = @file_get_contents($yaml_url);
    if ($yaml_content === false)
      yaml_error("webots.yaml file not found, please add the file at the root level of your repository.");
  }

  # yaml file variables
  $docker = 'docker://cyberbotics/webots:latest';
  $publish = 'true';
  $type = '';
  $benchmark = '';
  $competition = '';
  $worlds = array();
  $world_list_end = false;

  # delete empty lines
  $yaml_content = preg_replace("/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/", "\n", $yaml_content);
  # parse yaml file
  $line = strtok($yaml_content, "\r\n");
  while ($line !== false) {
    if (substr($line, 0, 8) === 'publish:')
      $publish = trim(substr($line, 8), " ");
    elseif (substr($line, 0, 5) === 'uses:')
      $docker = trim(substr($line, 5), " ");
    elseif (substr($line, 0, 5) === 'type:')
      $type = trim(substr($line, 5), " ");
    elseif (substr($line, 0, 6) === 'world:')
      $world = trim(substr($line, 6), " ");
    elseif (substr($line, 0, 10) === 'benchmark:')
      $benchmark = trim(substr($line, 10), " ");
    elseif (substr($line, 0, 12) === 'competition:')
      $competition = trim(substr($line, 12), " ");
    elseif (substr($line, 0, 7) === 'worlds:') {
      $line = strtok("\r\n");
      while (substr($line, 0, 9) === '  - file:') {
        array_push($worlds, trim(substr($line, 9), " "));
        $line = strtok("\r\n");
      }
      $world_list_end = true;
    }
    if ($world_list_end === true)
      $world_list_end = false;
    else
      $line = strtok("\r\n");
  }

  # check if configuration makes sense
  if ($publish === 'false')
    yaml_error("Simulation upload failed. Make sure to set 'publish: true' in webots.yaml");
  elseif ($type === 'demo') {
    if (($world !== '') && (count($worlds) == 0))
      array_push($worlds, $world);
    elseif (($world !== '') && (count($worlds) > 0))
      yaml_error("only 'world' or 'worlds' should be defined, not both.");
    elseif (($world === '') && (count($worlds) == 0))
      yaml_error("world file not defined.");
  } elseif ($type === 'benchmark' || $type === 'competition') {
    if (($world !== '') && (count($worlds) == 0))
      array_push($worlds, $world);
    elseif (count($worlds) > 0)
      yaml_error("with $type type please only define one world.");
    elseif ($world === '')
      yaml_error("world file not defined.");
  } elseif ($type === 'competitor') {
    if ($benchmark !== '' && $competition !== '')
      yaml_error("with competitor type please only define one scenario (benchmark or competition)");
    elseif ($benchmark === '' && $competition === '')
      yaml_error("with competitor type please define a scenario (benchmark or competition)");
  } else
    yaml_error("type not defined.");

  # return array with YAML file info
  return array($docker, $type, $publish, $worlds, $benchmark, $competition);
}
?>
