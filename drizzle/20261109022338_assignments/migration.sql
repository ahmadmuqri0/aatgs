CREATE TABLE `assignment` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`due_date` integer,
	`file_name` text NOT NULL,
	`file_key` text NOT NULL,
	`file_size` integer NOT NULL,
	`active_generation_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_assignment_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_assignment_active_generation_id_generation_id_fk` FOREIGN KEY (`active_generation_id`) REFERENCES `generation`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `generation` (
	`id` text PRIMARY KEY,
	`assignment_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`model` text NOT NULL,
	`error` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_generation_assignment_id_assignment_id_fk` FOREIGN KEY (`assignment_id`) REFERENCES `assignment`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `task` (
	`id` text PRIMARY KEY,
	`generation_id` text NOT NULL,
	`position` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`completed_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_task_generation_id_generation_id_fk` FOREIGN KEY (`generation_id`) REFERENCES `generation`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `assignment_userId_idx` ON `assignment` (`user_id`);--> statement-breakpoint
CREATE INDEX `generation_assignmentId_idx` ON `generation` (`assignment_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `task_generationId_position_idx` ON `task` (`generation_id`,`position`);