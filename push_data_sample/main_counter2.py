#!/usr/bin/env python
# -*- coding: utf-8 -*-
import copy
import time
import sqlite3
from datetime import datetime, timedelta
import concurrent.futures

import cv2

from damoyolo.damoyolo_onnx import DAMOYOLO

# グローバル変数の定義
# モデルのインスタンスを格納する変数
model = None 
# スコアの閾値
score_th = 0.4
# 非最大抑制の閾値
nms_th = 0.85
# COCOデータセットのクラス名リスト
coco_classes = []
# カウント結果を格納するリスト
count_list = []
# 次の分単位の時刻
next_minute = (datetime.now() + timedelta(minutes=1)).replace(second=0, microsecond=0)
# DAMO-YOLOの処理を行うフレームレートを制限
fps_limit = 0.5  
# データベース接続
conn = None
# カーソル
c = None

def main():
    global model, score_th, nms_th, coco_classes, count_list, next_minute, fps_limit, conn, c

    # カメラセレクト変数 #######################################################
    cap_device = 1  # 0にするとデフォルトのUSBカメラ、1にするとRTSPストリーム
    cap_width = 960
    cap_height = 540
    image_path = None

    model_path = 'C:/Users/camera/AppData/Local/anaconda3/envs/camera/user/damoyolo/model/damoyolo_tinynasL45_L_519.onnx'
    score_th = 0.42
    nms_th = 0.85

    # SQLiteデータベースに接続
    conn = sqlite3.connect('gym_visitors.db')
    c = conn.cursor()

    # テーブルの作成（存在しない場合）
    c.execute("""
    CREATE TABLE IF NOT EXISTS average_people_count (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        average_count INTEGER NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)
    conn.commit()

    # カメラ準備 ###############################################################
    if cap_device == 0:
        cap = cv2.VideoCapture(cap_device)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, cap_width)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, cap_height)
    elif cap_device == 1:
        rtsp_url = "rtsp://Asukaoita1:Asukaoita1@192.168.11.6:554/live0"
        cap = open_rtsp_stream(rtsp_url)
        while not cap.isOpened():
            print("Error: Unable to open RTSP stream. Retrying in 5 seconds...")
            time.sleep(5)
            cap = open_rtsp_stream(rtsp_url)

    # モデルロード #############################################################
    model = DAMOYOLO(
        model_path,
        providers=[
            'CPUExecutionProvider',
        ],
    )

    # COCOクラスリスト読み込み
    with open('coco_classes.txt', 'rt') as f:
        coco_classes = f.read().rstrip('\n').split('\n')

    # スレッドプールの作成
    executor = concurrent.futures.ThreadPoolExecutor(max_workers=2)

    last_processed_time = time.time()

    # ウインドウのサイズを調整可能に設定
    cv2.namedWindow('DAMO-YOLO ONNX Sample', cv2.WINDOW_NORMAL)

    if image_path is not None:
        image = cv2.imread(image_path)

        # 推論実施 ##############################################################
        start_time = time.time()
        bboxes, scores, class_ids = model(image, nms_th=nms_th)
        elapsed_time = time.time() - start_time
        print('Elapsed time', elapsed_time)

        # 描画 ##################################################################
        image = draw_debug(
            image,
            elapsed_time,
            score_th,
            bboxes,
            scores,
            class_ids,
            coco_classes,
        )

        cv2.imshow('DAMO-YOLO ONNX Sample', image)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    else:
        while True:
            start_time = time.time()

            # カメラキャプチャ ################################################
            ret, frame = cap.read()
            if not ret:
                print("Error: Frame capture failed. Reconnecting to stream...")
                cap.release()
                time.sleep(5)
                cap = open_rtsp_stream(rtsp_url)
                continue

            # フレームレート制限
            if (start_time - last_processed_time) >= (1.0 / fps_limit):
                last_processed_time = start_time

                # 非同期でフレームを処理
                future = executor.submit(process_frame, frame)
                debug_image = future.result()

                # 画面反映 #########################################################
                cv2.imshow('DAMO-YOLO ONNX Sample', debug_image)

            # キー処理(ESC：終了) ##############################################
            key = cv2.waitKey(1)
            if key == 27:  # ESC
                break
            if key == ord('q'):  # q
                break

        cap.release()
        cv2.destroyAllWindows()

        # 接続を閉じる（必要に応じて）
        conn.close()

def draw_debug(
    image,
    elapsed_time,
    score_th,
    bboxes,
    scores,
    class_ids,
    coco_classes,
):
    debug_image = copy.deepcopy(image)

    for bbox, score, class_id in zip(bboxes, scores, class_ids):
        x1, y1, x2, y2 = int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])

        if score_th > score:
            continue

        if coco_classes[int(class_id)] != 'person':
            continue

        # バウンディングボックス
        debug_image = cv2.rectangle(
            debug_image,
            (x1, y1),
            (x2, y2),
            (0, 255, 0),
            thickness=2,
        )

        # クラスID、スコア
        score = '%.2f' % score
        text = '%s:%s' % (str(coco_classes[int(class_id)]), score)
        debug_image = cv2.putText(
            debug_image,
            text,
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            thickness=2,
        )

    # 推論時間
    text = 'Elapsed time:' + '%.0f' % (elapsed_time * 1000)
    text = text + 'ms'
    debug_image = cv2.putText(
        debug_image,
        text,
        (10, 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 255, 0),
        thickness=2,
    )

    return debug_image

def open_rtsp_stream(url):
    cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)
    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'H264'))
    return cap

def process_frame(frame):
    global model, score_th, nms_th, coco_classes, count_list, next_minute

    start_time = time.time()

    # 推論実施
    bboxes, scores, class_ids = model(frame, nms_th=nms_th)
    elapsed_time = time.time() - start_time

    # 人数カウント
    person_count = 0
    for bbox, score, class_id in zip(bboxes, scores, class_ids):
        if score_th > score:
            continue
        if coco_classes[int(class_id)] == 'person':
            person_count += 1

    # カウントをリストに追加
    count_list.append(person_count)

    # 1分ごとの平均カウント計算とデータベースへの挿入
    if datetime.now() >= next_minute:
        average_count = sum(count_list) // len(count_list)
        insert_average_count(average_count)
        count_list.clear()
        next_minute = (datetime.now() + timedelta(minutes=1)).replace(second=0, microsecond=0)

    # デバッグ描画
    debug_image = draw_debug(
        frame,
        elapsed_time,
        score_th,
        bboxes,
        scores,
        class_ids,
        coco_classes,
    )

    return debug_image

def insert_average_count(average_count):
    # 新しいSQLite接続を作成
    conn = sqlite3.connect('gym_visitors.db')
    c = conn.cursor()
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    c.execute("INSERT INTO average_people_count (average_count, timestamp) VALUES (?, ?)", (average_count, timestamp))
    conn.commit()
    conn.close()
    print(f"Inserted average count: {average_count} at {timestamp}")

if __name__ == '__main__':
    main()
