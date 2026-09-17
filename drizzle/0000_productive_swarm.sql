CREATE TABLE `episodes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`series_id` integer NOT NULL,
	`season_number` integer DEFAULT 1 NOT NULL,
	`episode_number` integer NOT NULL,
	`title_fa` text,
	`aired_at` integer,
	`official_url` text,
	`status` text DEFAULT 'discovered' NOT NULL,
	`source_confidence` real DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_episodes_series_number` ON `episodes` (`series_id`,`season_number`,`episode_number`);--> statement-breakpoint
CREATE INDEX `idx_episodes_aired_at` ON `episodes` (`aired_at`);--> statement-breakpoint
CREATE TABLE `ingestion_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`run_key` text NOT NULL,
	`status` text NOT NULL,
	`items_found` integer DEFAULT 0 NOT NULL,
	`items_published` integer DEFAULT 0 NOT NULL,
	`error_summary` text,
	`started_at` integer NOT NULL,
	`finished_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_ingestion_runs_key` ON `ingestion_runs` (`run_key`);--> statement-breakpoint
CREATE INDEX `idx_ingestion_runs_started` ON `ingestion_runs` (`started_at`);--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`episode_id` integer NOT NULL,
	`audience` text NOT NULL,
	`rank` integer,
	`rating` real NOT NULL,
	`share` real,
	`measured_on` integer NOT NULL,
	`source_id` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_ratings_episode_audience` ON `ratings` (`episode_id`,`audience`);--> statement-breakpoint
CREATE INDEX `idx_ratings_date_audience` ON `ratings` (`measured_on`,`audience`);--> statement-breakpoint
CREATE TABLE `recaps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`episode_id` integer NOT NULL,
	`language` text DEFAULT 'fa' NOT NULL,
	`title` text NOT NULL,
	`dek` text,
	`body` text NOT NULL,
	`short_summary` text,
	`quality_score` real DEFAULT 0 NOT NULL,
	`model` text,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_recaps_episode_language` ON `recaps` (`episode_id`,`language`);--> statement-breakpoint
CREATE INDEX `idx_recaps_published_at` ON `recaps` (`published_at`);--> statement-breakpoint
CREATE TABLE `series` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title_tr` text NOT NULL,
	`title_fa` text NOT NULL,
	`network` text,
	`status` text DEFAULT 'unknown' NOT NULL,
	`air_day` integer,
	`official_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_series_slug` ON `series` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_series_status` ON `series` (`status`);--> statement-breakpoint
CREATE TABLE `source_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` integer NOT NULL,
	`external_id` text NOT NULL,
	`url` text NOT NULL,
	`content_hash` text NOT NULL,
	`raw_json` text NOT NULL,
	`discovered_at` integer NOT NULL,
	`processed_at` integer,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_source_items_source_external` ON `source_items` (`source_id`,`external_id`);--> statement-breakpoint
CREATE INDEX `idx_source_items_processed` ON `source_items` (`processed_at`);--> statement-breakpoint
CREATE TABLE `sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`base_url` text NOT NULL,
	`kind` text NOT NULL,
	`priority` integer DEFAULT 100 NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`last_success_at` integer,
	`last_failure_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_sources_key` ON `sources` (`key`);