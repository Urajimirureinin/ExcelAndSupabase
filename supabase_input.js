const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const csv = require('fast-csv');

// Supabaseの設定
const supabaseUrl = process.env.SUPABASE_URL; // URL
const supabaseKey = process.env.SUPABASE_KEY; //secretKey
const supabase = createClient(supabaseUrl, supabaseKey);

const csvPath = path.join(__dirname, process.env.CSV_PATH);

async function updateTableFromCSV() {
  const records = [];

  // 1. CSV読み込み
  fs.createReadStream(csvPath)
    .pipe(csv.parse({ headers: true }))
    .on('data', (row) => {
        records.push({
          id: parseInt(row.id),
          name: row.name,
          tags: row.tags.split(',').map(tag => tag.trim()),
        });
    })
    .on('end', async () => {
      console.log(`CSV読み込み完了。${records.length} 件`);

      // 2. 既存データ削除
      const { error: deleteError } = await supabase.from(process.env.SUPABASE_TABLE).delete().neq('id', 0);
      if (deleteError) {
        console.error('削除エラー:', deleteError.message);
        return;
      }
      console.log('既存データ削除完了');

      // 3. 新規データ挿入（複数件）
      const { error: insertError } = await supabase.from(process.env.SUPABASE_TABLE).insert(records);
      if (insertError) {
        console.error('挿入エラー:', insertError.message);
        return;
      }

      console.log('テーブルの上書き完了！');
    });
}

updateTableFromCSV();
