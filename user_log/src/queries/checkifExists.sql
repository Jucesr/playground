if db_id('HERMOSILLO_USER_LOG') is not null
	select '1' as exist
else
	select '0' as exist