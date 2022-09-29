CREATE TABLE `animation` (
  `id` int(11) NOT NULL,
  `updated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `uploaded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title` varchar(256) NOT NULL,
  `description` varchar(2048) NOT NULL,
  `version` varchar(16) NOT NULL,
  `duration` int(11) NOT NULL,
  `size` int(11) NOT NULL,
  `viewed` int(11) NOT NULL DEFAULT '0',
  `user` int(11) NOT NULL,
  `branch` varchar(256) NOT NULL DEFAULT 'main',
  `uploading` bit(1) DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `animation`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `animation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

CREATE TABLE `server` (
  `id` int(11) NOT NULL,
  `url` varchar(2048) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `share` float NOT NULL,
  `load` float NOT NULL,
  `started` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `server`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY (`url`),
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

CREATE TABLE `project` (
  `id` int(11) NOT NULL,
  `url` varchar(2048) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `stars` int(11) NOT NULL,
  `title` varchar(256) NOT NULL,
  `description` varchar(2048) NOT NULL,
  `version` varchar(16) NOT NULL,
  `type` enum('demo','competition','benchmark','') NOT NULL,
  `branch` varchar(256) CHARACTER SET utf8 NOT NULL DEFAULT 'main',
  `competitors` int(11) NOT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `viewed` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `project`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `url` (`url`),
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(254) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `password` varchar(64) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `token` varchar(32) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

CREATE TABLE `repository` (
  `server` int(11) NOT NULL,
  `url` varchar(2048) CHARACTER SET ascii COLLATE ascii_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `repository`
  ADD PRIMARY KEY (`server`,`url`);

CREATE TABLE `server_branch` (
  `id` int(11) NOT NULL,
  `branch` varchar(256) NOT NULL DEFAULT 'main'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `server_branch`
  ADD PRIMARY KEY (`id`,`branch`);

CREATE TABLE `proto` (
  `id` int(11) NOT NULL,
  `url` varchar(2048) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `stars` int(11) NOT NULL,
  `name` varchar(256) CHARACTER SET utf8mb4 NOT NULL,
  `description` varchar(2048) CHARACTER SET utf8mb4 NOT NULL,
  `version` varchar(16) NOT NULL,
  `branch` varchar(256) CHARACTER SET utf8mb4 NOT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `viewed` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `proto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `url_branch` (`url`,`branch`) USING BTREE;
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

COMMIT;
