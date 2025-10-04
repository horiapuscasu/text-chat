<?php
// +----------------------------------------------------------------------+
// | PHP Version 4                                                        |
// +----------------------------------------------------------------------+
// | Copyright (c) 1997-2003 The PHP Group                                |
// +----------------------------------------------------------------------+
// | This source file is subject to version 2.0 of the PHP license,       |
// | that is bundled with this package in the file LICENSE, and is        |
// | available at through the world-wide-web at                           |
// | http://www.php.net/license/2_02.txt.                                 |
// | If you did not receive a copy of the PHP license and are unable to   |
// | obtain it through the world-wide-web, please send a note to          |
// | license@php.net so we can mail you a copy immediately.               |
// +----------------------------------------------------------------------+
// | Author: Michael Wallner <mike@php.net>                               |
// +----------------------------------------------------------------------+
//
// $Id: APR_md5.php,v 1.1 2004-01-02 12:43:18 mike Exp $

/**
* Emulates MD5 encryption from Apache Portable Runtime (APR)
* 
* @author       Michael Wallner <mike@php.net>
* @package      Crypt_APR_md5
* @category     Encryption
*/

/**
* Allowed 64 characters
*/
$GLOBALS['_CRYPT_APR_MD5_64'] = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
* Emulates MD5 encrytion from Apache Portable Runtime (APR)
* as used by htpasswd binary for generating Authbasic passwd files.
*
* Based upon Perl's Crypt::PasswdMD5 by Luis Munoz.
* 
* <kbd><u>
* Usage Example:
* </u></kbd>
* <code>
* 
* $encrypted_str = Crypt_APR_md5::encrypt('abc');
* 
* </code>
* 
* @author   Michael Wallner <mike@php.net>
* @version  $Revision: 1.1 $
* @access   public
*/
class Crypt_APR_md5 {

	/**
    * Convert to allowed 64 characters
    *
    * @access   private
    * @return   string
    * @param    string  $value
    * @param    int     $count
    */
	function _to64($value, $count){
		$result = '';
		$count  = abs($count);
		while(--$count) {
			$result .= $GLOBALS['_CRYPT_APR_MD5_64'][$value & 0x3f];
			$value >>= 6;
		}
		return $result;
	}

	/**
    * Convert hexadecimal string to binary data
    *
    * @access   private
    * @return   mixed
    * @param    string  $hex
    */
	function _bin($hex){
		$rs = '';
		$ln = strlen($hex);
		for($i = 0; $i < $ln; $i += 2) {
			$rs .= chr(array_shift(sscanf(substr($hex, $i, 2), '%x')));
		}
		return $rs;
	}

	/**
    * Encrypt string (with given salt)
    *
    * @access   public
    * @return   string  encrypted passwd
    * @param    string  $string     the sting to encrypt
    * @param    string  $salt       the salt to use for encryption
    */
	function encrypt($string, $salt = null){
		if (is_null($salt)) {
			$salt = Crypt_APR_md5::_genSalt();
		} elseif (preg_match('/^\$apr1\$/', $salt)) {
			$salt = preg_replace('/^\$apr1\$(.{8}).*/', '\\1', $salt);
		} else {
			$salt = substr($salt, 0,8);
		}

		$length     = strlen($string);
		$context    = $string . '$apr1$' . $salt;
		$binary     = Crypt_APR_md5::_bin(md5($string . $salt . $string));

		for ($i = $length; $i > 0; $i -= 16) {
			$context .= substr($binary, 0, ($i > 16 ? 16 : $i));
		}
		for ( $i = $length; $i > 0; $i >>= 1) {
			$context .= ($i & 1) ? chr(0) : $string[0];
		}

		$binary = Crypt_APR_md5::_bin(md5($context));

		for($i = 0; $i < 1000; $i++) {
			$new = ($i & 1) ? $string : substr($binary, 0,16);
			if ($i % 3) {
				$new .= $salt;
			}
			if ($i % 7) {
				$new .= $string;
			}
			$new .= ($i & 1) ? substr($binary, 0,16) : $string;
			$binary = Crypt_APR_md5::_bin(md5($new));
		}

		$p = array();
		for ($i = 0; $i < 5; $i++) {
			$k = $i + 6;
			$j = $i + 12;
			if ($j == 16) {
				$j = 5;
			}
			$p[] = Crypt_APR_md5::_to64(
			(ord($binary[$i]) << 16) |
			(ord($binary[$k]) << 8) |
			(ord($binary[$j])),
			5
			);
		}

		return
		'$apr1$' . $salt . '$' . implode($p) .
		Crypt_APR_md5::_to64(ord($binary[11]), 3);
	}

	/**
    * Generate salt
    *
    * @access   private
    * @return   string
    */
	function _genSalt(){
		$rs = '';
		for($i = 0; $i < 8; $i++) {
			$rs .= $GLOBALS['_CRYPT_APR_MD5_64'][rand(0,63)];
		}
		return $rs;
	}
	//functia adaugata de mine pentru salvare utilizator
	function saveUser($user,$pass,$file){
		$bUserExists = false;
		//daca nu am fisierul il scriu
		$file = str_replace("/",DIRECTORY_SEPARATOR,$file);
		if(stripos($file,":")!==false){
			$file = addslashes($file);
		}
		//echo $file;
		//deschid fisierul intr-un array si vad daca exista userul
		$aFile = file($file,FILE_SKIP_EMPTY_LINES);
		if(my_count($aFile)){
			$aFile = array_map('my_escape', $aFile);
		}
		if(my_count($aFile)){
			for($i=0;$i<my_count($aFile);$i++){
				$line=$aFile[$i];
				list($fuser,$fpass)=explode(':',$line);
				//echo "<pre>".print_r($aFile[$i],1)."</pre>";
				if($fuser==$user){
					/*$new_pass = "/:".md5($user. ':/:' . $pass);//Crypt_APR_md5::encrypt($pass);
					$aFile[$i] = $user.":".$new_pass;*/
					$new_pass = Crypt_APR_md5::encrypt($pass);
					$aFile[$i] = $user.":".$new_pass;
					file_put_contents($file,implode(PHP_EOL,$aFile).PHP_EOL);
					$bUserExists = true;
					break;
				}
			}
		}
		if(!$bUserExists){
			/*$new_pass = "/:".md5($user. ':/:' . $pass);//Crypt_APR_md5::encrypt($pass);
			$new_line = $user.":".$new_pass;*/
			$new_pass = Crypt_APR_md5::encrypt($pass);
			$new_line = $user.":".$new_pass;
			file_put_contents($file,$new_line.PHP_EOL,FILE_APPEND);
		}
		file_put_contents($file,
			preg_replace(
				'/\R+/',
				"\n",
				file_get_contents($file)
			)
		);
	}
}
function my_escape($n){
	return str_replace(PHP_EOL,'',$n);
}
?>