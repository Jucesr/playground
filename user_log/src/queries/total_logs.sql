/****** Script for SelectTopNRows command from SSMS  ******/

DECLARE @START_DATE VARCHAR(10) = '2018-08-01';
DECLARE @END_DATE VARCHAR(10) = '2018-09-01';

SELECT 
	COUNT(*) AS TOTAL_LOGS
FROM 
	(
		SELECT 
		username 
		FROM 
			User_logs
		WHERE 
			DATE > @START_DATE AND
			DATE < @END_DATE
		GROUP BY username
	) AS C
