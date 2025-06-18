CREATE TABLE "champions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"name" varchar NOT NULL,
	"title" text NOT NULL,
	"blurb" text NOT NULL,
	"image" text NOT NULL,
	"tags" text[] NOT NULL
);
