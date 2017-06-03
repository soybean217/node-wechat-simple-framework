/*
SQLyog Community v11.1 (64 bit)
MySQL - 5.6.19-log : Database - cms_db
*********************************************************************
*/


/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`cms_db` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `cms_db`;

/*Table structure for table `tbl_wechat_tokens` */

DROP TABLE IF EXISTS `tbl_wechat_tokens`;

CREATE TABLE `tbl_wechat_tokens` (
  `appId` varchar(100) NOT NULL,
  `token` varchar(300) DEFAULT NULL,
  `nextTime` bigint(20) DEFAULT '0' COMMENT '下次去获取token的时间',
  `lastModTime` bigint(20) DEFAULT NULL COMMENT '本记录最后修改时间',
  `validTime` bigint(20) DEFAULT NULL COMMENT '当前token有效到期时间',
  `secret` varchar(100) DEFAULT NULL COMMENT '密钥',
  `jsapiTicket` varchar(200) DEFAULT NULL,
  `jsapiTicketValidTime` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`appId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Data for the table `tbl_wechat_tokens` */

insert  into `tbl_wechat_tokens`(`appId`,`token`,`nextTime`,`lastModTime`,`validTime`,`secret`,`jsapiTicket`,`jsapiTicketValidTime`) values ('wxb011e7747898ad8c','H-9iCwCcB_D0tFLUHaS9ahAZmN4tCqpTCxVCTzO9NKGBlt2Hy2OogUrkD-uCTBo8nVOYbZnqWhGbqvE2sp_tFkAElj3bG-Bwkks0cDZEftOZ4vqjfu-2JpBRzBnc1kRzJWScAIAOBX',0,1477880950333,1496489553846,'','sM4AOVdWfPE4DxkXGEs8VCnK-aIgnOrnP0SpeeBGg12g41LkJOq9iYgzuoqqRm0-eKuAOrA9aE-tzLKs_kPCSg',1496489553846);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
