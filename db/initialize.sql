
CREATE SCHEMA IF NOT EXISTS stfcgroupup;
USE stfcgroupup;
CREATE TABLE IF NOT EXISTS command_cnt (
	command char(20) NOT NULL,
	count bigint unsigned NOT NULL DEFAULT 0,
	PRIMARY KEY (command),
	UNIQUE KEY command_cnt_command_UNIQUE (command)
) ENGINE=InnoDB DEFAULT CHARSET=UTF8MB4;

delimiter //
CREATE PROCEDURE IF NOT EXISTS INC_CNT(
	IN cmd CHAR(20)
)
BEGIN
	declare oldCnt bigint unsigned;
	set oldCnt = (SELECT count FROM command_cnt WHERE command = cmd);
	UPDATE command_cnt SET count = oldCnt + 1 WHERE command = cmd;
END//
delimiter ;

CREATE TABLE IF NOT EXISTS guild_settings (
	guildId bigint unsigned NOT NULL,
	lfgChannelId bigint unsigned NOT NULL,
	managerRoleId bigint unsigned NOT NULL,
	logChannelId bigint unsigned NOT NULL,
	PRIMARY KEY (guildId, lfgChannelId)
) ENGINE=InnoDB DEFAULT CHARSET=UTF8MB4;

CREATE TABLE IF NOT EXISTS active_events (
	messageId bigint unsigned NOT NULL,
	channelId bigint unsigned NOT NULL,
	guildId bigint unsigned NOT NULL,
	ownerId bigint unsigned NOT NULL,
	eventTime datetime NOT NULL,
	notifiedFlag tinyint(1) NOT NULL DEFAULT 0,
	lockedFlag tinyint(1) NOT NULL DEFAULT 0,
	PRIMARY KEY (messageId, channelId)
) ENGINE=InnoDB DEFAULT CHARSET=UTF8MB4;

CREATE TABLE IF NOT EXISTS custom_activities (
	id int unsigned NOT NULL AUTO_INCREMENT,
	guildId bigint unsigned NOT NULL,
	activityTitle char(35) NOT NULL,
	activitySubtitle char(50) NOT NULL,
	maxMembers tinyint NOT NULL,
	PRIMARY KEY (id),
	UNIQUE KEY custom_activities_id_UNIQUE (id)
) ENGINE=InnoDB DEFAULT CHARSET=UTF8MB4;

CREATE OR REPLACE VIEW db_size AS
	SELECT
		table_name AS "table",
		ROUND(((data_length + index_length) / 1024 / 1024), 3) AS "size",
		table_rows AS "rows"
	FROM information_schema.TABLES
	WHERE
		table_schema = "stfcgroupup"
		AND table_name <> "db_size";
