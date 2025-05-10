使い方
1. nodejs(https://nodejs.org/ja/download)をinstallし、PATHを通す。(nodeとnpmが使えればOK)
2. require.batを実行して必要なモジュールをinstallする。
3. .envというファイルで、URL、KEY、TABLE名など設定しておく。(KEYは開発用のものを使うとトラブルが起きにくい)
3. エクセルでこのフォルダ(supabase_input,supabase_outputと同じ階層)にマクロ付きブック(.xlsm)を保存。
4. 保存したブックに標準モジュールを追加し、macro.txtの内容をコピーして貼り付け。
5. inm.xlsmのinmシートにある「Supabaseの上書き」と書いてある図形と「Supabaseからimport」と書いてある図形を作成したブックにコピー&ペースト
6. 「Supabaseからimport」と書いてある図形をクリックする。
7. .envで記述したテーブルからデータがインポートされる
8. 「Supabaseにプッシュ」と書いてある図形をクリックすると.envで記述したテーブルのデータを上書きすることができる。