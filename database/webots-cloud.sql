CREATE TABLE `animation` (
  `id` int(11) NOT NULL,
  `updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `uploaded` timestamp NOT NULL DEFAULT current_timestamp(),
  `title` varchar(256) NOT NULL,
  `description` varchar(2048) NOT NULL,
  `duration` int(11) NOT NULL,
  `size` int(11) NOT NULL,
  `viewed` int (11) NOT NULL,
  `owner` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `animation`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `animation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

CREATE TABLE `server` (
  `id` int(11) NOT NULL,
  `updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `url` varchar(2048) CHARACTER SET ascii COLLATE ascii_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `server`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `url` (`url`);

ALTER TABLE `server`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

CREATE TABLE `project` (
  `id` int(11) NOT NULL,
  `updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `url` varchar(2048) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `parent` int(11) NOT NULL,
  `title` varchar(256) NOT NULL,
  `stars` int(11) NOT NULL,
  `language` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `project`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `url` (`url`);

ALTER TABLE `project`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(254) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `password` varchar(64) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

COMMIT;
