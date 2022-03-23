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
  list($username, $repository, $version, $folder, $world) = $check_url;
  $yaml_url = "https://raw.githubusercontent.com/$username/$repository/$version$folder/webots.yaml";
  $yaml_content = @file_get_contents($yaml_url);

  if ($yaml_content === false)
    return "'webots.yaml' file not found, please add the file at the root level of your repository.";

  $type = '';
  $line = strtok($yaml_content, "\r\n");
  while ($line !== false) {
    if (substr($line, 0, 3) === 'type')
      $type = trim(substr(5, null), " ");
    $line = strtok("\r\n");
  }
  return "Type is $type";
  
  return array($type);
}
?>
