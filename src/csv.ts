/**
 * CSV処理モジュール
 */

import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import * as fs from 'fs/promises';

export interface CompanyData {
  companyName: string;
  homepageUrl?: string;
  contactEmail?: string;
}

/**
 * CSVファイルを読み込んで企業データを取得
 */
export async function readCompaniesFromCsv(filePath: string): Promise<CompanyData[]> {
  const fileContent = await fs.readFile(filePath, 'utf-8');

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records.map((record: any) => ({
    companyName: record['企業名'] || record['companyName'] || record['name'] || '',
    homepageUrl: record['ホームページURL'] || record['URL'] || record['homepageUrl'] || record['url'] || undefined,
    contactEmail: record['お問い合わせメールアドレス'] || record['メールアドレス'] || record['contactEmail'] || record['email'] || undefined,
  }));
}

/**
 * 企業データをCSVファイルに書き込み
 */
export async function writeCompaniesToCsv(
  filePath: string,
  companies: CompanyData[]
): Promise<void> {
  const records = companies.map((company) => ({
    '企業名': company.companyName,
    'ホームページURL': company.homepageUrl || '',
    'お問い合わせメールアドレス': company.contactEmail || '',
  }));

  const csvContent = stringify(records, {
    header: true,
    columns: ['企業名', 'ホームページURL', 'お問い合わせメールアドレス'],
  });

  await fs.writeFile(filePath, csvContent, 'utf-8');
}
