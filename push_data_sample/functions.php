<?php
// 子テーマ用関数
if ( !defined( 'ABSPATH' ) ) exit;

// 子テーマ用のビジュアルエディタースタイルを適用
add_editor_style();

// REST APIのエンドポイントを登録
add_action('rest_api_init', function () {
    register_rest_route('gym/v1', '/people', array(
        'methods' => 'POST',
        'callback' => 'update_gym_people_count',
        'permission_callback' => 'check_api_permissions',
    ));
    register_rest_route('gym/v1', '/test', array(
        'methods' => 'GET',
        'callback' => 'test_endpoint',
        'permission_callback' => 'check_api_permissions',
    ));
    register_rest_route('gym/v1', '/forecast', array(
        'methods' => 'POST',
        'callback' => 'update_gym_forecast',
        'permission_callback' => 'check_api_permissions',
    ));
});

function check_api_permissions($request) {
    // 管理者権限を持つユーザーのみ許可
    return current_user_can('manage_options');
}

function update_gym_people_count($request) {
    // POSTリクエストから人数と更新日時を取得
    $people_count = $request->get_param('count');
    $last_updated = $request->get_param('last_updated');

    // エラーログに記録
    error_log("Received count: " . $people_count);
    error_log("Last Updated: " . $last_updated);

    // オプションに人数と更新日時を保存
    update_option('gym_people_count', $people_count);
    update_option('gym_last_updated', $last_updated);

    return new WP_REST_Response(array('message' => 'People count and last updated time updated', 'count' => $people_count, 'last_updated' => $last_updated), 200);
}

function test_endpoint() {
    return new WP_REST_Response(array('message' => 'Test endpoint is working'), 200);
}

// ショートコードを作成
function display_gym_people_count() {
    $people_count = get_option('gym_people_count', 'データがありません');
    $last_updated = get_option('gym_last_updated', '更新日時がありません');
    
    $background_color = 'white';
    $message = 'データがありません';

    if ($people_count !== 'データがありません') {
        $people_count = intval($people_count);
        
        if ($people_count <= 3) {
            $background_color = 'green';
            $message = '快適';
        } elseif ($people_count >= 4 && $people_count <= 6) {
            $background_color = 'blue';
            $message = '普通';
        } elseif ($people_count >= 7) {
            $background_color = 'red';
            $message = '混雑';
        }
    }
    
    $current_time = new DateTime('now', new DateTimeZone(wp_timezone_string()));
    $last_updated_time = new DateTime($last_updated, new DateTimeZone(wp_timezone_string()));
    $interval = $current_time->diff($last_updated_time);
    $minutes_diff = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;

    $status_message = '';
    if ($minutes_diff > 5) {
        $status_message = '<div style="color: red;">システム停止中</div>';
    }
    
    return '<div style="padding: 10px;">
                <div>現在のフリーウェイトエリア利用者数: ' . esc_html($people_count) . '</div>
                <div style="padding: 5px;">
                    状態: <span style="background-color: ' . esc_attr($background_color) . '; color: white; padding: 2px 5px;">' . esc_html($message) . '</span>
                </div>
                <div>最終更新: ' . esc_html($last_updated) . '</div>
                <div>現在時刻: ' . esc_html($current_time->format('Y-m-d H:i:s')) . '</div>
                ' . $status_message . '
            </div>';
}
add_shortcode('gym_people_count', 'display_gym_people_count');


// 予測データを受信するエンドポイント
add_action('rest_api_init', function () {
    register_rest_route('gym/v1', '/forecast', array(
        'methods' => 'POST',
        'callback' => 'update_gym_forecast',
        'permission_callback' => 'check_api_permissions',
    ));
});

function update_gym_forecast(WP_REST_Request $request) {
    $data = $request->get_json_params();

    if (empty($data['forecast_data']) || empty($data['color_ranges'])) {
        return new WP_Error('empty_data', 'No data provided', array('status' => 400));
    }

    // デバッグ用に受信したデータをログに記録
    error_log('Received forecast data: ' . print_r($data['forecast_data'], true));
    error_log('Received color ranges: ' . print_r($data['color_ranges'], true));

    update_option('gym_forecast_data', $data['forecast_data']);
    update_option('gym_color_ranges', $data['color_ranges']);

    return new WP_REST_Response('Forecast data and color ranges updated', 200);
}

// 予測データを表示するショートコード
function display_gym_forecast() {
    $forecast_data = get_option('gym_forecast_data', array());
    $color_ranges = get_option('gym_color_ranges', array());

    // データが存在しない場合の処理
    if (empty($forecast_data)) {
        return '<div>予測データがありません。</div>';
    }

    // カテゴリと値の準備
    $days = array_keys($forecast_data);
    $time_slots = array_keys(reset($forecast_data));
    sort($time_slots); // 時間スロットを昇順にソート
    $series = [];

    foreach ($forecast_data as $day => $times) {
        foreach ($times as $time => $value) {
            if (!isset($series[$time])) {
                $series[$time] = [
                    'name' => $time,
                    'data' => []
                ];
            }
            $series[$time]['data'][] = [
                'x' => $day,
                'y' => $value
            ];
        }
    }

    // 出力バッファリングを開始
ob_start(); ?>
<div id="forecast-chart-container">
    <div id="forecast-chart"></div>
</div>
<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
    var options = {
        chart: {
            type: 'heatmap',
            height: 1000, // 縦長にするための高さを設定
            width: '100%' // 横幅を画面幅に合わせる
        },
        xaxis: {
            categories: <?php echo json_encode($days); ?>,
            labels: {
                show: true,
                style: {
                    fontWeight: 'bold' // 曜日のラベルを太字にする
                }
            },
            tooltip: {
                enabled: false // 横軸のツールチップを無効にする
            },
            position: 'top' // 曜日ラベルを上部に配置
        },
        yaxis: {
            categories: <?php echo json_encode($time_slots); ?>,
            labels: {
                show: true,
                rotate: 0,
                trim: true,
                maxHeight: 100,
                formatter: function (value, index) {
                    // 2時間ごとにラベルを表示
                    var hour = parseInt(value.split(':')[0], 10);
                    if (hour % 2 === 0 && value.split(':')[1] === "00") {
                        return value;
                    } else {
                        return '';
                    }
                },
                style: {
                    fontSize: '14px', // フォントサイズを大きく
                    fontWeight: 'bold' // フォントを太字に
                }
            }
        },
        plotOptions: {
            heatmap: {
                shadeIntensity: 0.5,
                colorScale: {
                    ranges: [
                        {from: 0, to: 1, color: '#E0F7FA', name: '快適'}, // 快適
                        {from: 2, to: 3, color: '#B2EBF2', name: '普通'}, // 普通
                        {from: 4, to: 5, color: '#80DEEA', name: 'やや混雑'}, // やや混雑
                        {from: 6, to: 7, color: '#4DD0E1', name: '混雑'}, // 混雑
                        {from: 8, to: 9, color: '#00838F', name: '非常に混雑'} // 非常に混雑
                    ]
                },
                dataLabels: {
                    enabled: false // データラベルを非表示にする
                }
            }
        },
        series: <?php echo json_encode(array_values($series)); ?>,
        dataLabels: {
            enabled: false // データラベルを完全に非表示にする
        },
        tooltip: {
            enabled: true, // ツールチップを有効にする
            y: {
                formatter: function(value) {
                    return value + " 人"; // 人数を表示
                }
            }
        },
        legend: {
            markers: {
                fillColors: [
                    '#E0F7FA', '#B2EBF2', '#80DEEA', '#4DD0E1', '#00838F'
                ] // カラーレンジと一致させる
            }
        }
    };

    var chart = new ApexCharts(document.querySelector("#forecast-chart"), options);
    chart.render();
});
</script>

<?php
// 出力バッファリングの内容を返す
return ob_get_clean();
}
add_shortcode('gym_forecast', 'display_gym_forecast');
