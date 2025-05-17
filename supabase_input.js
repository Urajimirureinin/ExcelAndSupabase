const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const csv = require('fast-csv');

// 環境変数
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Service Role key 推奨
const tableName = process.env.SUPABASE_TABLE;
const csvPath = path.join(__dirname, process.env.CSV_PATH);

const supabase = createClient(supabaseUrl, supabaseKey);

async function ensureColumnsExist(newColumns) {
  // 現在のテーブルのカラム情報を取得
  const { data: columns, error } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_name', tableName);

  if (error) {
    console.error('カラム情報の取得失敗:', error.message);
    return;
  }

  const existingCols = columns.map(col => col.column_name);
  const columnsToAdd = newColumns.filter(col => !existingCols.includes(col));

  for (const col of columnsToAdd) {
    const alterSQL = `ALTER TABLE ${tableName} ADD COLUMN "${col}" text;`; // text型で追加（必要に応じて変更可）
    const { error: sqlError } = await supabase.rpc('execute_sql', { sql: alterSQL });
    if (sqlError) {
      console.error(`列 '${col}' の追加に失敗:`, sqlError.message);
    } else {
      console.log(`列 '${col}' を追加しました`);
    }
  }
}

async function updateTableFromCSV() {
  const records = [];
  let headers = [];

  // CSV読み込み
  fs.createReadStream(csvPath)
    .pipe(csv.parse({ headers: true }))
    .on('headers', (hdrs) => {
      headers = hdrs;
    })
    .on('data', (row) => {
      // 必要な変換（tags列は配列化）
      console.log(row)
      const converted = {};
      for (const key in row) {
        if (key === 'id') {
          converted.id = parseInt(row.id);
        } else if (row[key].includes(",")) {
          converted[key] = row[key].split(',').map(tag => tag.trim());
        } else {
          converted[key] = row[key];
        }
      }
      records.push(converted);
    })
    .on('end', async () => {
      console.log(`CSV読み込み完了。${records.length} 件`);

      // Supabaseテーブルに列がなければ追加
      await ensureColumnsExist(headers);

      // 既存データ削除
      const { error: deleteError } = await supabase.from(tableName).delete().neq('id', 0);
      if (deleteError) {
        console.error('削除エラー:', deleteError.message);
        return;
      }
      console.log('既存データ削除完了');

      // 新規データ挿入
      const { error: insertError } = await supabase.from(tableName).insert(records);
      if (insertError) {
        console.error('挿入エラー:', insertError.message);
        return;
      }

      console.log('テーブルの上書き完了！');
    });
}

updateTableFromCSV();
