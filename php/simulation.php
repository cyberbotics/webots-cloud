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
    return "YAML file error: $msg";
  }

  # get file from github
  list($username, $repository, $version, $folder, $world) = $check_url;
  $yaml_url = "https://raw.githubusercontent.com/$username/$repository/$version$folder/webots.yaml";
  $yaml_content = @file_get_contents($yaml_url);
  if ($yaml_content === false) {
    $yaml_url = "https://raw.githubusercontent.com/$username/$repository/$version$folder/webots.yml";
    $yaml_content = @file_get_contents($yaml_url);
    if ($yaml_content === false)
      return yaml_error("webots.yaml file not found.");
  }

  # yaml file variables
  $publish = 'true (default)';
  $type = '';
  $benchmark = '';
  $competition = '';
  $init = '';

  # delete empty lines
  $yaml_content = preg_replace("/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/", "\n", $yaml_content);
  # parse yaml file
  $line = strtok($yaml_content, "\r\n");
  while ($line !== false) {
    if (substr($line, 0, 8) === 'publish:')
      $publish = trim(substr($line, 8), " ");
    elseif (substr($line, 0, 5) === 'type:')
      $type = trim(substr($line, 5), " ");
    elseif (substr($line, 0, 10) === 'benchmark:')
      $benchmark = trim(substr($line, 10), " ");
    elseif (substr($line, 0, 12) === 'competition:')
      $competition = trim(substr($line, 12), " ");
    elseif (substr($line, 0, 5) === 'init:') {
      $line = strtok("\r\n");
      $line = strtok("\\");
      $temp = gettype($line);
      return "Type of line is $temp: $line";
      if (trim(substr($line, 5), " ") === '|') {
        $line = strtok("\r\n");
        while (true) {
          if (substr($line, 0, 2) === '  ') {
            $init .= substr($line, 2);
          }
          if (substr(trim($line, " "), -1) !== '/')
            break;
          $line = strtok("\r\n");
        }
      } else
        $init = substr($line, 5);
    }
    $line = strtok("\r\n");
  }

  return ("Information in webots.yaml file: <br> type: $type <br> publish: $publish <br> benchmark: $benchmark <br> competition: $competition <br> init: $init");

  # check if configuration makes sense
  if ($publish === 'false')
    return yaml_error("Project publish failed. Make sure to set 'publish: true' in webots.yaml");
  elseif ($type === 'competitor') {
    if ($benchmark !== '' && $competition !== '')
      return yaml_error("competitor type only requires one scenario (benchmark or competition)");
    elseif ($benchmark === '' && $competition === '')
      return yaml_error("competitor type requires a scenario (benchmark or competition)");
  } elseif ($type === '')
    return yaml_error("type not defined.");

  # return array with YAML file info
  return array($type, $benchmark, $competition, $init);
}
?>
