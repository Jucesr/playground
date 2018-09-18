DECLARE @START_DATE VARCHAR(10) = @SD;
DECLARE @END_DATE VARCHAR(10) = @ED;

SELECT 
	role,
	month,
	COUNT(ROLE) AS count
FROM(

	SELECT
		Username,
		ROLE,
		month
	FROM
		(
			SELECT 
				id,
				username,
				role,
				SUBSTRING(convert(varchar(20),date, 121), 0 , 8) AS month

			FROM 
				User_logs
			WHERE 
				DATE > @START_DATE AND
				DATE < @END_DATE
		) AS D
		GROUP BY month, ROLE, Username

	) AS BD
GROUP BY month, ROLE
ORDER BY month