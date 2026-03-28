-- Add GitHub connection fields to design_systems
ALTER TABLE design_systems
  ADD COLUMN IF NOT EXISTS github_repo text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS github_branch text DEFAULT 'main',
  ADD COLUMN IF NOT EXISTS github_token text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS github_installation_id integer DEFAULT NULL;

COMMENT ON COLUMN design_systems.github_repo IS 'GitHub repo in owner/repo format';
COMMENT ON COLUMN design_systems.github_branch IS 'Target branch for auto-PR (default: main)';
COMMENT ON COLUMN design_systems.github_token IS 'GitHub PAT (fallback for email login users)';
COMMENT ON COLUMN design_systems.github_installation_id IS 'GitHub App installation ID';
