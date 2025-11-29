/// <reference path="../types.d.ts" />
// @ts-ignore - Deno uses URL imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface PropertyRequest {
  action: string;
  propertyId?: string;
  data?: any;
  params?: any;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1];

    let result;

    switch (action) {
      case 'upload-images':
        result = await handleImageUpload(req, supabaseClient, user);
        break;

      case 'delete-images':
        result = await handleImageDelete(req, supabaseClient, user);
        break;

      case 'get-properties':
        result = await getProperties(req, supabaseClient, user);
        break;

      case 'get-property':
        result = await getProperty(req, supabaseClient, user);
        break;

      case 'create-property':
        result = await createProperty(req, supabaseClient, user);
        break;

      case 'update-property':
        result = await updateProperty(req, supabaseClient, user);
        break;

      case 'delete-property':
        result = await deleteProperty(req, supabaseClient, user);
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Property manager error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleImageUpload(req: Request, supabaseClient: any, user: any) {
  try {
    const formData = await req.formData();
    const propertyId = formData.get('propertyId') as string;
    const files = formData.getAll('images') as File[];

    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }

    // Check if property exists and user has permission
    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('id, created_by, assigned_agent')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      throw new Error('Property not found');
    }

    // Check permissions
    if (property.created_by !== user.id && property.assigned_agent !== user.id) {
      // Check if user is admin
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        throw new Error('Permission denied');
      }
    }

    const uploadedImages = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxFileSize = 50 * 1024 * 1024; // 50MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Only JPEG, PNG, WebP and GIF are allowed.`);
      }

      // Validate file size
      if (file.size > maxFileSize) {
        throw new Error(`File too large: ${file.name}. Maximum size is 50MB.`);
      }

      // Generate unique filename
      const fileExt = getFileExtension(file.name);
      const fileName = `${user.id}/${propertyId}/${Date.now()}_${i}${fileExt}`;

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Upload to Supabase Storage
      const { data, error } = await supabaseClient.storage
        .from('property-images')
        .upload(fileName, uint8Array, {
          contentType: file.type,
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', error);
        throw new Error(`Failed to upload ${file.name}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from('property-images')
        .getPublicUrl(fileName);

      uploadedImages.push(publicUrl);
    }

    // Update property with new images
    const { data: currentProperty } = await supabaseClient
      .from('properties')
      .select('images')
      .eq('id', propertyId)
      .single();

    const existingImages = currentProperty?.images || [];
    const updatedImages = [...existingImages, ...uploadedImages];

    const { data: updatedProperty, error: updateError } = await supabaseClient
      .from('properties')
      .update({ images: updatedImages })
      .eq('id', propertyId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating property images:', updateError);
      throw new Error('Failed to update property with images');
    }

    return {
      message: 'Images uploaded successfully',
      images: uploadedImages,
      property: updatedProperty
    };

  } catch (error) {
    console.error('Error in image upload:', error);
    throw error;
  }
}

async function handleImageDelete(req: Request, supabaseClient: any, user: any) {
  try {
    const { propertyId, imageUrl } = await req.json();

    if (!propertyId || !imageUrl) {
      throw new Error('Property ID and image URL are required');
    }

    // Check if property exists and user has permission
    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('id, created_by, assigned_agent, images')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      throw new Error('Property not found');
    }

    // Check permissions
    if (property.created_by !== user.id && property.assigned_agent !== user.id) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        throw new Error('Permission denied');
      }
    }

    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.findIndex((part: string) => part === 'property-images');
    if (bucketIndex === -1) {
      throw new Error('Invalid image URL');
    }

    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    // Delete from storage
    const { error: deleteError } = await supabaseClient.storage
      .from('property-images')
      .remove([filePath]);

    if (deleteError) {
      console.error('Error deleting file from storage:', deleteError);
      throw new Error('Failed to delete image from storage');
    }

    // Update property images array
    const updatedImages = (property.images || []).filter((img: string) => img !== imageUrl);

    const { data: updatedProperty, error: updateError } = await supabaseClient
      .from('properties')
      .update({ images: updatedImages })
      .eq('id', propertyId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating property images:', updateError);
      throw new Error('Failed to update property');
    }

    return {
      message: 'Image deleted successfully',
      property: updatedProperty
    };

  } catch (error) {
    console.error('Error in image delete:', error);
    throw error;
  }
}

async function getProperties(req: Request, supabaseClient: any, user: any) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;

    const page = parseInt(params.get('page') || '1');
    const limit = parseInt(params.get('limit') || '10');
    const search = params.get('search');
    const propertyType = params.get('property_type');
    const listingType = params.get('listing_type');
    const status = params.get('status');
    const city = params.get('city');
    const district = params.get('district');
    const minPrice = params.get('min_price');
    const maxPrice = params.get('max_price');
    const minArea = params.get('min_area');
    const maxArea = params.get('max_area');
    const rooms = params.get('rooms');
    const createdBy = params.get('created_by');
    const assignedAgent = params.get('assigned_agent');
    const sortBy = params.get('sort_by') || 'created_at';
    const sortOrder = params.get('sort_order') || 'desc';

    let query = supabaseClient
      .from('properties')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`);
    }

    if (propertyType) {
      query = query.eq('property_type', propertyType);
    }

    if (listingType) {
      query = query.eq('listing_type', listingType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (city) {
      query = query.eq('city', city);
    }

    if (district) {
      query = query.eq('district', district);
    }

    if (minPrice) {
      query = query.gte('price', parseInt(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseInt(maxPrice));
    }

    if (minArea) {
      query = query.gte('area', parseInt(minArea));
    }

    if (maxArea) {
      query = query.lte('area', parseInt(maxArea));
    }

    if (rooms) {
      query = query.eq('rooms', parseInt(rooms));
    }

    if (createdBy) {
      query = query.eq('created_by', createdBy);
    }

    if (assignedAgent) {
      query = query.eq('assigned_agent', assignedAgent);
    }

    // Apply sorting and pagination
    const { data: properties, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      properties: properties || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    };

  } catch (error) {
    console.error('Error getting properties:', error);
    throw error;
  }
}

async function getProperty(req: Request, supabaseClient: any, user: any) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const propertyId = pathParts[pathParts.length - 2]; // Assuming URL like /property-manager/get-property/{id}

    const { data: property, error } = await supabaseClient
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (error) throw error;

    if (!property) {
      throw new Error('Property not found');
    }

    return property;

  } catch (error) {
    console.error('Error getting property:', error);
    throw error;
  }
}

async function createProperty(req: Request, supabaseClient: any, user: any) {
  try {
    const propertyData = await req.json();

    const { data: property, error } = await supabaseClient
      .from('properties')
      .insert({
        ...propertyData,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return property;

  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
}

async function updateProperty(req: Request, supabaseClient: any, user: any) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const propertyId = pathParts[pathParts.length - 2];
    const propertyData = await req.json();

    // Check if property exists and user has permission
    const { data: existingProperty } = await supabaseClient
      .from('properties')
      .select('created_by, assigned_agent')
      .eq('id', propertyId)
      .single();

    if (!existingProperty) {
      throw new Error('Property not found');
    }

    // Check permissions
    if (existingProperty.created_by !== user.id && existingProperty.assigned_agent !== user.id) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        throw new Error('Permission denied');
      }
    }

    const { data: property, error } = await supabaseClient
      .from('properties')
      .update({
        ...propertyData,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId)
      .select()
      .single();

    if (error) throw error;

    return property;

  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
}

async function deleteProperty(req: Request, supabaseClient: any, user: any) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const propertyId = pathParts[pathParts.length - 2];

    // Check if property exists and user has permission
    const { data: property } = await supabaseClient
      .from('properties')
      .select('created_by, assigned_agent, images')
      .eq('id', propertyId)
      .single();

    if (!property) {
      throw new Error('Property not found');
    }

    // Check permissions
    if (property.created_by !== user.id && property.assigned_agent !== user.id) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        throw new Error('Permission denied');
      }
    }

    // Delete associated images from storage
    if (property.images && property.images.length > 0) {
      const filePaths = property.images.map((imageUrl: string) => {
        const urlParts = imageUrl.split('/');
        const bucketIndex = urlParts.findIndex((part: string) => part === 'property-images');
        return urlParts.slice(bucketIndex + 1).join('/');
      });

      await supabaseClient.storage
        .from('property-images')
        .remove(filePaths);
    }

    // Delete property
    const { error } = await supabaseClient
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) throw error;

    return { message: 'Property deleted successfully' };

  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
}

// Helper function to get file extension
function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
}