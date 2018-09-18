
DECLARE @START_DATE VARCHAR(10) = @SD;
DECLARE @END_DATE VARCHAR(10) = @ED;

SELECT 
	ROLE,
	HOUR,
	COUNT(ROLE) AS COUNT
FROM(

	SELECT
		Username,
		ROLE,
		HOUR
	FROM
		(
			SELECT 
				id,
				username,
				role,
				SUBSTRING(convert(varchar(20),date, 121), 0 , 11) AS D,
				SUBSTRING(convert(varchar(20),date, 121), 12 , 2) AS HOUR,
				SUBSTRING(convert(varchar(20),date, 121), 15 , 2) AS M

			FROM 
				User_logs
			WHERE 
				DATE > @START_DATE AND
				DATE < @END_DATE
		) AS D
		GROUP BY HOUR, ROLE, Username

	) AS BD
GROUP BY HOUR, ROLE
ORDER BY HOUR