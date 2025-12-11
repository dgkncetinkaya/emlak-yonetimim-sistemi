// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

interface ScrapedData {
  title: string;
  price: number;
  city: string;
  district: string;
  neighborhood: string;
  area_gross: number;
  area_net: number;
  rooms: string;
  building_age: string;
  floor: string;
  total_floors: string;
  heating: string;
  bathrooms: number;
  balcony: boolean;
  elevator: boolean;
  parking: boolean;
  furnished: boolean;
  usage_status: string;
  in_site: boolean;
  site_name: string;
  dues: number;
  suitable_for_credit: boolean;
  deed_status: string;
  listing_type: 'for_sale' | 'for_rent';
  description: string;
  images: string[];
  features: {
    interior: string[];
    exterior: string[];
    view: string[];
    facade: string[];
    proximity: string[];
    transportation: string[];
  };
}

function extractDataFromHTML(html: string): ScrapedData | null {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (!doc) return null;

    // Extract title
    const titleElement = doc.querySelector('.classifiedDetailTitle h1');
    const title = titleElement?.textContent?.trim() || '';

    // Extract price
    const priceElement = doc.querySelector('.classified-price-wrapper');
    const priceText = priceElement?.textContent?.trim() || '0';
    const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;

    // Extract location
    const locationLinks = doc.querySelectorAll('.classifiedDetailTitle h2 a');
    const city = locationLinks[0]?.textContent?.trim() || '';
    const district = locationLinks[1]?.textContent?.trim() || '';
    const neighborhood = locationLinks[2]?.textContent?.trim() || '';

    // Extract property details
    const detailsList = doc.querySelectorAll('.classifiedInfoList li');
    const details: Record<string, string> = {};
    
    detailsList.forEach((li: any) => {
      const strong = li.querySelector('strong')?.textContent?.trim();
      const span = li.querySelector('span')?.textContent?.trim();
      if (strong && span) {
        details[strong] = span;
      }
    });

    // Extract images
    const images: string[] = [];
    const imageElements = doc.querySelectorAll('.s-image');
    imageElements.forEach((img: any) => {
      const src = img.getAttribute('src') || img.getAttribute('data-src');
      if (src && !src.includes('blank') && !images.includes(src)) {
        // Convert thumbnail to full size
        const fullSizeUrl = src.replace('thmb_', 'x5_').replace('.avif', '.jpg');
        images.push(fullSizeUrl);
      }
    });

    // Extract description
    const descElement = doc.querySelector('#classifiedDescription');
    const description = descElement?.textContent?.trim() || '';

    // Extract features
    const features = {
      interior: [] as string[],
      exterior: [] as string[],
      view: [] as string[],
      facade: [] as string[],
      proximity: [] as string[],
      transportation: [] as string[]
    };

    // Get all feature sections
    const featureSections = doc.querySelectorAll('#classifiedProperties h3');
    featureSections.forEach((h3: any) => {
      const heading = h3.textContent?.trim();
      const ul = h3.nextElementSibling;
      
      if (ul && ul.tagName === 'UL') {
        const selectedItems: string[] = [];
        const selectedLis = ul.querySelectorAll('li.selected');
        selectedLis.forEach((li: any) => {
          const text = li.textContent?.trim();
          if (text) selectedItems.push(text);
        });

        if (heading === 'İç Özellikler') features.interior = selectedItems;
        else if (heading === 'Dış Özellikler') features.exterior = selectedItems;
        else if (heading === 'Manzara') features.view = selectedItems;
        else if (heading === 'Cephe') features.facade = selectedItems;
        else if (heading === 'Muhit') features.proximity = selectedItems;
        else if (heading === 'Ulaşım') features.transportation = selectedItems;
      }
    });

    // Determine listing type
    const listingType = details['Emlak Tipi']?.includes('Satılık') ? 'for_sale' : 'for_rent';

    return {
      title,
      price,
      city,
      district,
      neighborhood,
      area_gross: parseInt(details['m² (Brüt)']) || 0,
      area_net: parseInt(details['m² (Net)']) || 0,
      rooms: details['Oda Sayısı'] || '',
      building_age: details['Bina Yaşı'] || '',
      floor: details['Bulunduğu Kat'] || '',
      total_floors: details['Kat Sayısı'] || '',
      heating: details['Isıtma'] || '',
      bathrooms: parseInt(details['Banyo Sayısı']) || 1,
      balcony: details['Balkon'] === 'Var',
      elevator: details['Asansör'] === 'Var',
      parking: details['Otopark'] === 'Var',
      furnished: details['Eşyalı'] === 'Evet',
      usage_status: details['Kullanım Durumu'] || '',
      in_site: details['Site İçerisinde'] === 'Evet',
      site_name: details['Site Adı'] || '',
      dues: parseInt(details['Aidat (TL)']) || 0,
      suitable_for_credit: details['Krediye Uygun'] === 'Evet',
      deed_status: details['Tapu Durumu'] || '',
      listing_type: listingType,
      description,
      images,
      features
    };
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    if (!url || !url.includes('sahibinden.com')) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL. Please provide a valid sahibinden.com URL.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch page: ${response.statusText}` }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const html = await response.text()
    const data = extractDataFromHTML(html)

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Failed to extract data from page' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/scrape-sahibinden' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"url":"https://www.sahibinden.com/ilan/emlak-konut-satilik-..."}'

*/
