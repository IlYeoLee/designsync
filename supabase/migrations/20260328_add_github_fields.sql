-- Add GitHub repo connection fields to design_systems
ALTER TABLE design_systems
  ADD COLUMN IF NOT EXISTS github_repo text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS github_branch text DEFAULT 'main',
  ADD COLUMN IF NOT EXISTS github_token text DEFAULT NULL;

COMMENT ON COLUMN design_systems.github_repo IS 'GitHub repo in owner/repo format (e.g. IlYeoLee/my-app)';
COMMENT ON COLUMN design_systems.github_branch IS 'Target branch for auto-PR (default: main)';
COMMENT ON COLUMN design_systems.github_token IS 'GitHub PAT or OAuth provider_token for PR creation';
