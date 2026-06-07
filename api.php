<?php
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('Asia/Taipei');

$DATA_FILE = 'posts.json';
$UPLOAD_DIR = 'uploads/';
$PASSWORD = '11411133';

$action = $_GET['action'] ?? '';

if (!file_exists($DATA_FILE)) {
    file_put_contents($DATA_FILE, json_encode([]));
}

if ($action === 'upload') {
    if (!is_dir($UPLOAD_DIR)) {
        if (!@mkdir($UPLOAD_DIR, 0777, true)) {
            echo json_encode(['success' => false, 'message' => '無法建立資料夾']); exit;
        }
    }
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
        $target = $UPLOAD_DIR . uniqid() . '.' . $ext;
        if (move_uploaded_file($_FILES['file']['tmp_name'], $target)) {
            echo json_encode(['success' => true, 'url' => $target]); exit;
        }
    }
    echo json_encode(['success' => false, 'message' => '上傳失敗']); exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if ($action === 'login') {
    if (($input['password'] ?? '') === $PASSWORD) { echo json_encode(['success' => true]); } 
    else { http_response_code(401); echo json_encode(['success' => false]); }
    exit;
}

if ($action === 'get_posts') {
    echo file_get_contents($DATA_FILE); exit;
}

if ($action === 'add_post') {
    $posts = json_decode(file_get_contents($DATA_FILE), true);
    if (!is_array($posts)) $posts = [];
    array_unshift($posts, [
        'id' => time(),
        'title' => $input['title'] ?? '',
        'cover' => $input['cover'] ?? '',
        'content' => $input['content'] ?? '',
        'date' => date('Y/m/d')
    ]);
    file_put_contents($DATA_FILE, json_encode($posts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['success' => true]); exit;
}

// 新增：刪除文章功能
if ($action === 'delete_post') {
    $deleteId = $input['id'] ?? '';
    $posts = json_decode(file_get_contents($DATA_FILE), true);
    if (!is_array($posts)) $posts = [];
    $posts = array_filter($posts, function($p) use ($deleteId) {
        return (string)$p['id'] !== (string)$deleteId;
    });
    file_put_contents($DATA_FILE, json_encode(array_values($posts), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['success' => true]); exit;
}

echo json_encode(['success' => false]);
?>