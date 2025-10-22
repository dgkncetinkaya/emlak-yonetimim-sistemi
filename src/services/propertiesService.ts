import { supabase } from '../lib/supabase';

export interface Property {
  id: string;
  title: string;
  description?: string;
  property_type: 'apartment' | 'villa' | 'house' | 'office' | 'land' | 'commercial';
  status: 'active' | 'inactive' | 'sold' | 'rented';
  listing_type: 'for_sale' | 'for_rent';
  price: number;
  area?: number;
  size?: number; // Alias for area
  rooms?: string;
  room_count?: string; // Alias for rooms
  address: string;
  location?: string; // Combined address field
  city: string;
  district: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  image_urls?: string[]; // Alias for images
  cover_image_url?: string;
  deed_status?: 'clear' | 'mortgage' | 'shared' | 'disputed';
  building_age?: number;
  floor?: number;
  floor_number?: number; // Alias for floor
  heating?: string;
  furnished?: boolean;
  features?: string[]; // Property features
  assigned_agent?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Related data
  assigned_agent_profile?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  created_by_profile?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
}

export interface PropertyFilters {
  page?: number;
  limit?: number;
  property_type?: string;
  status?: string;
  listing_type?: string;
  city?: string;
  district?: string;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  rooms?: string;
  assigned_agent?: string;
  created_by?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PropertyResponse {
  properties: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreatePropertyData {
  title: string;
  description?: string;
  property_type: string;
  status?: string;
  listing_type: string;
  price: number;
  area?: number;
  rooms?: string;
  address: string;
  city: string;
  district: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  cover_image_url?: string;
  deed_status?: string;
  building_age?: number;
  floor?: number;
  heating?: string;
  furnished?: boolean;
  assigned_agent?: string;
}

export interface UpdatePropertyData extends Partial<CreatePropertyData> {
  id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

class PropertiesService {
  async getProperties(filters: PropertyFilters = {}): Promise<PropertyResponse> {
    const { page = 1, limit = 10, sort_by = 'created_at', sort_order = 'desc', ...otherFilters } = filters;
    
    let query = supabase
      .from('properties')
      .select(`
        *,
        assigned_agent_profile:user_profiles!assigned_agent(id, full_name, email, phone),
        created_by_profile:user_profiles!created_by(id, full_name, email, phone)
      `);

    // Apply filters
    if (otherFilters.property_type) {
      query = query.eq('property_type', otherFilters.property_type);
    }
    if (otherFilters.status) {
      query = query.eq('status', otherFilters.status);
    }
    if (otherFilters.listing_type) {
      query = query.eq('listing_type', otherFilters.listing_type);
    }
    if (otherFilters.city) {
      query = query.eq('city', otherFilters.city);
    }
    if (otherFilters.district) {
      query = query.eq('district', otherFilters.district);
    }
    if (otherFilters.min_price) {
      query = query.gte('price', otherFilters.min_price);
    }
    if (otherFilters.max_price) {
      query = query.lte('price', otherFilters.max_price);
    }
    if (otherFilters.min_area) {
      query = query.gte('area', otherFilters.min_area);
    }
    if (otherFilters.max_area) {
      query = query.lte('area', otherFilters.max_area);
    }
    if (otherFilters.rooms) {
      query = query.eq('rooms', otherFilters.rooms);
    }
    if (otherFilters.assigned_agent) {
      query = query.eq('assigned_agent', otherFilters.assigned_agent);
    }
    if (otherFilters.created_by) {
      if (otherFilters.created_by === 'me') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq('created_by', user.id);
        }
      } else {
        query = query.eq('created_by', otherFilters.created_by);
      }
    }
    if (otherFilters.search) {
      query = query.or(`title.ilike.%${otherFilters.search}%,description.ilike.%${otherFilters.search}%,address.ilike.%${otherFilters.search}%`);
    }

    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Map Supabase fields to expected field names
    const mappedProperties = (data || []).map(property => ({
      ...property,
      image_urls: property.images || property.image_urls || [],
      size: property.area || property.size,
      room_count: property.rooms || property.room_count,
      floor_number: property.floor || property.floor_number,
      location: property.address || property.location,
      features: property.features || []
    }));

    return {
      properties: mappedProperties,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async getProperty(id: string): Promise<Property> {
    // Test data for development
    if (id === '1') {
      return {
        id: '1',
        title: 'Lüks 3+1 Daire - Beşiktaş',
        description: 'Beşiktaş\'ta deniz manzaralı, modern ve lüks 3+1 daire. Tüm odalar geniş ve ferah. Merkezi konumda, ulaşım imkanları mükemmel.',
        property_type: 'apartment',
        status: 'active',
        listing_type: 'for_sale',
        price: 2500000,
        area: 150,
        size: 150,
        rooms: '3+1',
        room_count: '3+1',
        address: 'Beşiktaş, İstanbul',
        location: 'Beşiktaş, İstanbul',
        city: 'İstanbul',
        district: 'Beşiktaş',
        neighborhood: 'Ortaköy',
        latitude: 41.0082,
        longitude: 29.0181,
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80'
        ],
        image_urls: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80'
        ],
        cover_image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        deed_status: 'clear',
        building_age: 5,
        floor: 8,
        floor_number: 8,
        heating: 'Kombi',
        furnished: true,
        features: ['Deniz Manzarası', 'Asansör', 'Otopark', 'Güvenlik', 'Balkon', 'Merkezi Sistem'],
        assigned_agent: null,
        created_by: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        assigned_agent_profile:user_profiles!assigned_agent(id, full_name, email, phone),
        created_by_profile:user_profiles!created_by(id, full_name, email, phone)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Map Supabase fields to component expected fields
    const mappedData = {
      ...data,
      // Map area to size for ListingDetail component
      size: data.area,
      // Map rooms to room_count for ListingDetail component
      room_count: data.rooms,
      // Map floor to floor_number for ListingDetail component
      floor_number: data.floor,
      // Map images to image_urls for ListingDetail component
      image_urls: data.images,
      // Create location field from address for ListingDetail component
      location: data.address,
      // Ensure features is an array (default to empty array if null/undefined)
      features: data.features || []
    };

    return mappedData;
  }

  async createProperty(data: CreatePropertyData): Promise<Property> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: property, error } = await supabase
      .from('properties')
      .insert({
        ...data,
        created_by: user.id
      })
      .select(`
        *,
        assigned_agent_profile:user_profiles!assigned_agent(id, full_name, email, phone),
        created_by_profile:user_profiles!created_by(id, full_name, email, phone)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return property;
  }

  async updateProperty(id: string, data: UpdatePropertyData): Promise<Property> {
    const { data: property, error } = await supabase
      .from('properties')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        assigned_agent_profile:user_profiles!assigned_agent(id, full_name, email, phone),
        created_by_profile:user_profiles!created_by(id, full_name, email, phone)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return property;
  }

  async deleteProperty(id: string): Promise<{ message: string }> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Property deleted successfully' };
  }

  async uploadPropertyImages(id: string, files: File[]): Promise<Property> {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (error) {
        throw new Error(error.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      return publicUrl;
    });

    const imageUrls = await Promise.all(uploadPromises);

    // Get current images
    const { data: currentProperty } = await supabase
      .from('properties')
      .select('images')
      .eq('id', id)
      .single();

    const currentImages = currentProperty?.images || [];
    const updatedImages = [...currentImages, ...imageUrls];

    // Update property with new images
    const { data: property, error } = await supabase
      .from('properties')
      .update({ 
        images: updatedImages,
        cover_image_url: updatedImages[0] || null
      })
      .eq('id', id)
      .select(`
        *,
        assigned_agent_profile:user_profiles!assigned_agent(id, full_name, email, phone),
        created_by_profile:user_profiles!created_by(id, full_name, email, phone)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return property;
  }

  async deletePropertyImage(id: string, imageUrl: string): Promise<Property> {
    // Get current images
    const { data: currentProperty } = await supabase
      .from('properties')
      .select('images, cover_image_url')
      .eq('id', id)
      .single();

    if (!currentProperty) {
      throw new Error('Property not found');
    }

    const currentImages = currentProperty.images || [];
    const updatedImages = currentImages.filter((img: string) => img !== imageUrl);

    // Update cover image if it was deleted
    let newCoverImage = currentProperty.cover_image_url;
    if (currentProperty.cover_image_url === imageUrl) {
      newCoverImage = updatedImages[0] || null;
    }

    // Update property
    const { data: property, error } = await supabase
      .from('properties')
      .update({ 
        images: updatedImages,
        cover_image_url: newCoverImage
      })
      .eq('id', id)
      .select(`
        *,
        assigned_agent_profile:user_profiles!assigned_agent(id, full_name, email, phone),
        created_by_profile:user_profiles!created_by(id, full_name, email, phone)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Delete from storage
    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      await supabase.storage
        .from('property-images')
        .remove([`${id}/${fileName}`]);
    }

    return property;
  }

  // Helper methods for common filters
  async getMyProperties(filters: Omit<PropertyFilters, 'created_by'> = {}): Promise<PropertyResponse> {
    return this.getProperties({ ...filters, created_by: 'me' });
  }

  async getPropertiesByAgent(agentId: string, filters: Omit<PropertyFilters, 'assigned_agent'> = {}): Promise<PropertyResponse> {
    return this.getProperties({ ...filters, assigned_agent: agentId });
  }

  async searchProperties(searchTerm: string, filters: Omit<PropertyFilters, 'search'> = {}): Promise<PropertyResponse> {
    return this.getProperties({ ...filters, search: searchTerm });
  }

  async getPropertiesByStatus(status: string, filters: Omit<PropertyFilters, 'status'> = {}): Promise<PropertyResponse> {
    return this.getProperties({ ...filters, status });
  }

  async getPropertiesByType(propertyType: string, filters: Omit<PropertyFilters, 'property_type'> = {}): Promise<PropertyResponse> {
    return this.getProperties({ ...filters, property_type: propertyType });
  }

  async getPropertiesByLocation(city: string, district?: string, filters: PropertyFilters = {}): Promise<PropertyResponse> {
    const locationFilters = { ...filters, city };
    if (district) {
      locationFilters.district = district;
    }
    return this.getProperties(locationFilters);
  }

  async getPropertiesByPriceRange(minPrice: number, maxPrice: number, filters: Omit<PropertyFilters, 'min_price' | 'max_price'> = {}): Promise<PropertyResponse> {
    return this.getProperties({ ...filters, min_price: minPrice, max_price: maxPrice });
  }

  async getPropertiesByAreaRange(minArea: number, maxArea: number, filters: Omit<PropertyFilters, 'min_area' | 'max_area'> = {}): Promise<PropertyResponse> {
    return this.getProperties({ ...filters, min_area: minArea, max_area: maxArea });
  }
}

export const propertiesService = new PropertiesService();
export default propertiesService;