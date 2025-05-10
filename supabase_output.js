const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { format } = require('@fast-csv/format');

// Supabaseの設定
const supabaseUrl = process.env.SUPABASE_URL; // URL
const supabaseKey = process.env.SUPABASE_KEY; //secretKey
const supabase = createClient(supabaseUrl, supabaseKey);

// 出力ファイル名
const outputFile = path.join(__dirname, process.env.CSV_PATH);

async function exportToCSV() {
  // データ取得
  const { data, error } = await supabase.from(process.env.SUPABASE_TABLE).select('*');
  if (error) {
    console.error('データ取得エラー:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('データが空です');
    return;
  }

  // CSV 書き出し
  const ws = fs.createWriteStream(outputFile);
  const csvStream = format({ headers: true });

  csvStream.pipe(ws).on('finish', () => {
    console.log('CSV 書き出し完了:', outputFile);
  });

  data.forEach(row => {
    csvStream.write({
      id: row.id,
      name: row.name,
      tags: row.tags.join(','), // カンマ区切りで1列に
    });
  });

  csvStream.end();
}

exportToCSV();
