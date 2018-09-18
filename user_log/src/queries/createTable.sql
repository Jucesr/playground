
USE [HERMOSILLO_USER_LOG]

-- /****** Object:  Table [dbo].[User_logs]    Script Date: 9/13/2018 3:03:10 PM ******/
SET ANSI_NULLS ON


SET QUOTED_IDENTIFIER ON


CREATE TABLE [dbo].[User_logs](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Username] [varchar](35) NOT NULL,
	[Role] [varchar](20) NULL,
	[date] [smalldatetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

