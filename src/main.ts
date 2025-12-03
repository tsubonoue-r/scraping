/**
 * Main logic for web scraping
 */

import { readCompaniesFromCsv, writeCompaniesToCsv, CompanyData } from './csv.js';
import { scrapeCompanyInfo } from './scraper.js';

export async function runScraping(inputFile: string, outputFile: string): Promise<void> {
  console.log('🌸 Web Scraping Tool - 企業情報取得');
  console.log('='.repeat(50));
  console.log(`📂 Input file: ${inputFile}`);
  console.log(`📂 Output file: ${outputFile}`);
  console.log('');

  try {
    console.log('📖 Reading CSV file...');
    const companies = await readCompaniesFromCsv(inputFile);
    console.log(`✓ Found ${companies.length} companies`);
    console.log('');

    console.log('🔍 Starting web scraping...');
    console.log('');

    const results: CompanyData[] = [];

    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      console.log(`[${i + 1}/${companies.length}] Processing: ${company.companyName}`);

      try {
        const info = await scrapeCompanyInfo(company.companyName);

        results.push({
          companyName: company.companyName,
          homepageUrl: info.homepageUrl || company.homepageUrl,
          contactEmail: info.contactEmail || company.contactEmail,
        });
      } catch (error) {
        console.error(`  ❌ Error: ${error}`);
        results.push({
          companyName: company.companyName,
          homepageUrl: company.homepageUrl,
          contactEmail: company.contactEmail,
        });
      }

      console.log('');
    }

    console.log('💾 Saving results to CSV...');
    await writeCompaniesToCsv(outputFile, results);
    console.log(`✓ Results saved to: ${outputFile}`);
    console.log('');

    const foundUrls = results.filter((r) => r.homepageUrl).length;
    const foundEmails = results.filter((r) => r.contactEmail).length;

    console.log('📊 Statistics:');
    console.log(`  Total companies: ${results.length}`);
    console.log(`  Homepage URLs found: ${foundUrls} (${Math.round((foundUrls / results.length) * 100)}%)`);
    console.log(`  Contact emails found: ${foundEmails} (${Math.round((foundEmails / results.length) * 100)}%)`);
    console.log('');

    console.log('✅ Process completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}
