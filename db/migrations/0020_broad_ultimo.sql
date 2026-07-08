CREATE TABLE "items" (
	"item_id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image" text NOT NULL,
	"tags" jsonb NOT NULL,
	"game_version" text NOT NULL
);
