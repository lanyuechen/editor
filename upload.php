<?php

$id = $_SERVER['HTTP_X_FILE_ID'];
$fn = $_SERVER['HTTP_X_FILE_NAME'];
preg_match('/.+(\..*)$/i', $fn, $fn);

$suffix = $fn[1];
$host = 'http://' . $_SERVER["HTTP_HOST"] . '/';
$path = 'uploads/' . date('Y-m-d',time()) . '/';
if(!file_exists($path)){
	mkdir($path, 0777, true);
}

$file_name = $path . time() . $suffix;

$contents = file_get_contents('php://input');
file_put_contents($file_name, $contents);

$msg['id'] = $id;
$msg['src'] = $host . 'works/editor/' . $file_name;
echo json_encode($msg);