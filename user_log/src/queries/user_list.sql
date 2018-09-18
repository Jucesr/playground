/****** Script for SelectTopNRows command from SSMS  ******/

DECLARE @START_DATE VARCHAR(10) = @SD;
DECLARE @END_DATE VARCHAR(10) = @ED;


SELECT 
	username,
	role
FROM 
	User_logs
WHERE 
	DATE > @START_DATE AND
	DATE < @END_DATE
GROUP BY username, role

