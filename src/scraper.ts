/**
 * Webスクレイピングモジュール
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * 企業名からホームページURLを検索（推測ベース）
 */
export async function searchCompanyWebsite(companyName: string): Promise<string | null> {
  // 企業名からドメインを推測するパターン
  const guessPatterns = [
    // そのまま .com
    () => companyName.toLowerCase().replace(/\s+/g, '') + '.com',
    // 株式会社などを除去して .com
    () => companyName.replace(/株式会社|有限会社|合同会社|Inc\.|LLC|Ltd\./gi, '').trim().toLowerCase().replace(/\s+/g, '') + '.com',
    // .co.jp パターン
    () => companyName.toLowerCase().replace(/\s+/g, '') + '.co.jp',
    // 株式会社などを除去して .co.jp
    () => companyName.replace(/株式会社|有限会社|合同会社|Inc\.|LLC|Ltd\./gi, '').trim().toLowerCase().replace(/\s+/g, '') + '.co.jp',
  ];

  for (const patternFunc of guessPatterns) {
    try {
      const domain = patternFunc();
      const url = `https://${domain}`;

      console.log(`  Trying: ${url}`);

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 10000,
        maxRedirects: 5,
      });

      if (response.status === 200) {
        console.log(`  ✓ Found: ${url}`);
        return url;
      }
    } catch (error) {
      // このパターンは失敗、次を試す
      continue;
    }
  }

  return null;
}

/**
 * ホームページからメールアドレスを抽出
 */
export async function extractEmailFromWebsite(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // お問い合わせページへのリンクを探す
    const contactLinks = $('a[href*="contact"], a[href*="inquiry"], a[href*="お問い合わせ"]');

    // お問い合わせページがある場合、そこから抽出を試みる
    if (contactLinks.length > 0) {
      const contactHref = contactLinks.first().attr('href');
      if (contactHref) {
        const contactUrl = new URL(contactHref, url).href;
        const contactResponse = await axios.get(contactUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
          timeout: 10000,
        });

        const $contact = cheerio.load(contactResponse.data);
        const emailFromContact = extractEmailFromHtml($contact.html() || '');
        if (emailFromContact) return emailFromContact;
      }
    }

    // メインページからメールアドレスを抽出
    return extractEmailFromHtml(response.data);
  } catch (error) {
    console.error(`Error extracting email from ${url}:`, error);
    return null;
  }
}

/**
 * HTML文字列からメールアドレスを抽出
 */
function extractEmailFromHtml(html: string): string | null {
  // メールアドレスの正規表現パターン
  const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const matches = html.match(emailPattern);

  if (matches && matches.length > 0) {
    // info@, contact@などの一般的なメールアドレスを優先
    const preferredEmails = matches.filter(
      (email) =>
        email.includes('info@') ||
        email.includes('contact@') ||
        email.includes('inquiry@') ||
        email.includes('support@')
    );

    if (preferredEmails.length > 0) {
      return preferredEmails[0].toLowerCase();
    }

    // 画像ファイルやスクリプトのメールアドレスは除外
    const validEmails = matches.filter(
      (email) =>
        !email.includes('.png') &&
        !email.includes('.jpg') &&
        !email.includes('.gif') &&
        !email.includes('example.com') &&
        !email.includes('sentry')
    );

    if (validEmails.length > 0) {
      return validEmails[0].toLowerCase();
    }
  }

  return null;
}

/**
 * 企業情報を取得（ホームページURLとメールアドレス）
 */
export async function scrapeCompanyInfo(companyName: string): Promise<{
  homepageUrl: string | null;
  contactEmail: string | null;
}> {
  console.log(`🔍 Searching for: ${companyName}`);

  // ホームページURLを検索
  const homepageUrl = await searchCompanyWebsite(companyName);

  if (!homepageUrl) {
    console.log(`  ❌ Homepage not found`);
    return { homepageUrl: null, contactEmail: null };
  }

  console.log(`  ✓ Homepage found: ${homepageUrl}`);

  // メールアドレスを抽出
  const contactEmail = await extractEmailFromWebsite(homepageUrl);

  if (contactEmail) {
    console.log(`  ✓ Email found: ${contactEmail}`);
  } else {
    console.log(`  ⚠ Email not found`);
  }

  // スクレイピングのマナーとして少し待機
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { homepageUrl, contactEmail };
}
