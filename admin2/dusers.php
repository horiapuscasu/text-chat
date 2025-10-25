<?php
ini_set('display_errors','Off');
//echo "<br>Example : http://localhost/set_pass.php?user=horia&pass=a&file=c:/apache/htdocs/pass";
include('APR_md5.php');
function my_count($arr){
	return is_countable($arr)?count($arr):0;
}

if(is_null($_REQUEST['file'])){
?>
<form method="POST" action="">
	<div>File: <input type="text" name="file" value="c:/apache/htdocs/admin2/pass"></div>
	<div><input type="submit" value="Set"></div>
</form>
<?php
}
elseif(is_null($_REQUEST['list'])){
	$arr_users = file($_REQUEST['file']);
	?>	
	<form method="POST" action="">
	<input type="hidden" name="file" value="<?=$_REQUEST['file'];?>">
	<?php
	for($i=0;$i<my_count($arr_users);$i++){
		$arr_user = explode(":",$arr_users[$i]);
		?>
		<div><?=$arr_user[0];?><input type="checkbox" name="line[]" value="<?=$i;?>"></div>
		<?php
	}
	?>
	<input type="hidden" name="list" value="1">
	<div><input type="submit" value="Delete"></div>
</form>
	<?php
}
else{
	$arr_users = file($_REQUEST['file']);
	for($i=0;$i<my_count($_REQUEST['line']);$i++){
		unset($arr_users[$_REQUEST['line'][$i]]);
	}
	$fusers = implode("",$arr_users);
	file_put_contents($_REQUEST['file'],$fusers);
	header("Location: index.php");
}
?>