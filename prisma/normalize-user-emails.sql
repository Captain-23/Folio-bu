-- One-time: store emails in lowercase for consistent login lookups
UPDATE "User" SET email = LOWER(TRIM(email)) WHERE email != LOWER(TRIM(email));
