<?php
//exec('htpasswd.exe -b passwordFile myUserame myPassword');
ini_set('display_errors','Off');
//echo "<br>Example : http://localhost/set_pass.php?user=horia&pass=a&file=c:/apache/htdocs/pass";
include('APR_md51.php');
function my_count($arr){
	return is_countable($arr)?count($arr):0;
}

if(is_null($_REQUEST['user'])){
?>
<form method="POST" action="">
	<div>User: <input type="text" name="user"></div>
	<div>Password : <input type="password" name="pass"></div>
	<div>File: <input type="text" name="file" value="c:/apache/htdocs/admin2/pass1"></div>
	<div><input type="submit" value="Set"></div>
</form>
<?php
}
else{
	$obj = new Crypt_APR_md5();
	$obj->saveUser($_REQUEST['user'],$_REQUEST['pass'],$_REQUEST['file']);
	header("Location: index.php");
}
?>