USE [master]


/* For security reasons the login is created disabled and with a random password. */
/****** Object:  Login [hermosillo_logger]    Script Date: 9/13/2018 3:05:12 PM ******/
CREATE LOGIN [hermosillo_logger] WITH PASSWORD= 'Jrt1Gr7Qg5oEhpYVbxkiIeeUNPM09rWISeOB4r7xLw', DEFAULT_DATABASE=[HERMOSILLO_USER_LOG], DEFAULT_LANGUAGE=[us_english], CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF


ALTER LOGIN [hermosillo_logger] ENABLE


ALTER SERVER ROLE [sysadmin] ADD MEMBER [hermosillo_logger]


ALTER SERVER ROLE [securityadmin] ADD MEMBER [hermosillo_logger]


ALTER SERVER ROLE [serveradmin] ADD MEMBER [hermosillo_logger]


ALTER SERVER ROLE [setupadmin] ADD MEMBER [hermosillo_logger]


ALTER SERVER ROLE [processadmin] ADD MEMBER [hermosillo_logger]


ALTER SERVER ROLE [diskadmin] ADD MEMBER [hermosillo_logger]


ALTER SERVER ROLE [dbcreator] ADD MEMBER [hermosillo_logger]


ALTER SERVER ROLE [bulkadmin] ADD MEMBER [hermosillo_logger]





