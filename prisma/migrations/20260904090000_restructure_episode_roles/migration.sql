-- Role model restructured from {PRODUCER, HOST, EDITOR} to
-- {LEADER_PRODUKSI, TIM_BRAINSTORMING, TIM_LIVE, TIM_EVALUASI} (product
-- decision — old role assignments are reset rather than mapped over, since
-- the "Peran Tim" feature was not yet in meaningful use).
TRUNCATE TABLE "EpisodeRole";

ALTER TYPE "EpisodeRoleType" RENAME TO "EpisodeRoleType_old";

CREATE TYPE "EpisodeRoleType" AS ENUM ('LEADER_PRODUKSI', 'TIM_BRAINSTORMING', 'TIM_LIVE', 'TIM_EVALUASI');

ALTER TABLE "EpisodeRole" ALTER COLUMN "role" TYPE "EpisodeRoleType" USING ("role"::text::"EpisodeRoleType");

DROP TYPE "EpisodeRoleType_old";
