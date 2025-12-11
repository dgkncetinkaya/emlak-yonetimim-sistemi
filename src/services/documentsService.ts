import { supabase } from '../lib/supabase';

// Types
export type DocumentType = 'yer_gosterme' | 'kira_sozlesmesi' | 'tahliye_taahhutnamesi' | 'kimlik_belgesi' | 'mali_belge' | 'tapu_belgesi' | 'sigorta_belgesi' | 'diger';
export type DocumentStatus = 'taslak' | 'tamamlandi' | 'iptal_edildi' | 'onay_bekliyor' | 'iptal' | 'beklemede';
export type DepartmentType = 'satis' | 'kiralama' | 'degerleme' | 'hukuk' | 'muhasebe';

export interface DocumentTemplate {
  id: string;
  name: string;
  type: DocumentType;
  file_url: string;
  file_size?: number;
  is_default: boolean;
  department?: DepartmentType;
  created_by?: string;
  created_at: string;
  updated_at: string;
  uploadedAt?: string;
  url?: string;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  file_url?: string;
  file_size?: number;
  template_id?: string;
  form_data?: any;
  has_signature: boolean;
  signature_data?: any;
  department?: DepartmentType;
  tags?: string[];
  notes?: string;
  created_by?: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
  // Relations
  template?: DocumentTemplate;
  created_by_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
  owner_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface DocumentTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  created_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_url: string;
  file_size?: number;
  changes_description?: string;
  created_by?: string;
  created_at: string;
  created_by_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface DocumentShare {
  id: string;
  document_id: string;
  shared_with: string;
  permission_level: 'view' | 'edit' | 'admin';
  shared_by?: string;
  expires_at?: string;
  created_at: string;
  shared_with_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
  shared_by_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface DocumentFilters {
  page?: number;
  limit?: number;
  type?: DocumentType;
  status?: DocumentStatus;
  department?: DepartmentType;
  tags?: string[];
  has_signature?: boolean;
  created_by?: string;
  owner_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  file_size_min?: number;
  file_size_max?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface DocumentResponse {
  documents: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TemplateFilters {
  page?: number;
  limit?: number;
  type?: DocumentType;
  department?: DepartmentType;
  is_default?: boolean;
  isActive?: boolean;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface TemplateResponse {
  templates: DocumentTemplate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateDocumentData {
  name: string;
  type: DocumentType;
  status?: DocumentStatus;
  file_url?: string;
  file_size?: number;
  template_id?: string;
  form_data?: any;
  has_signature?: boolean;
  signature_data?: any;
  department?: DepartmentType;
  tags?: string[];
  notes?: string;
  owner_id?: string;
}

export interface UpdateDocumentData extends Partial<CreateDocumentData> {
  id?: string;
}

export interface CreateTemplateData {
  name: string;
  type: DocumentType;
  file: File;
  is_default?: boolean;
  department?: DepartmentType;
  description?: string;
}

export interface UpdateTemplateData {
  name?: string;
  is_default?: boolean;
  department?: DepartmentType;
}

class DocumentsService {
  // Document CRUD Operations
  async getDocuments(filters: DocumentFilters = {}): Promise<DocumentResponse> {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      department,
      tags,
      has_signature,
      created_by,
      owner_id,
      search,
      date_from,
      date_to,
      file_size_min,
      file_size_max,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = filters;

    // İzolasyon: Sadece giriş yapan kullanıcının belgelerini getir
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    let query = supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('owner_id', user.id); // İzolasyon: Sadece kendi belgeleri

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (department) {
      query = query.eq('department', department);
    }

    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    if (has_signature !== undefined) {
      query = query.eq('has_signature', has_signature);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,notes.ilike.%${search}%`);
    }

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    if (file_size_min !== undefined) {
      query = query.gte('file_size', file_size_min);
    }

    if (file_size_max !== undefined) {
      query = query.lte('file_size', file_size_max);
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

    return {
      documents: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async getDocument(id: string): Promise<Document> {
    // İzolasyon: Sadece kendi belgesini görebilir
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        template:document_templates(id, name, type),
        created_by_profile:user_profiles!documents_created_by_fkey(id, full_name, email),
        owner_profile:user_profiles!documents_owner_id_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .eq('owner_id', user.id) // İzolasyon
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async createDocument(documentData: CreateDocumentData): Promise<Document> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...documentData,
        created_by: user?.id,
        owner_id: documentData.owner_id || user?.id
      })
      .select(`
        *,
        template:document_templates(id, name, type),
        created_by_profile:user_profiles!documents_created_by_fkey(id, full_name, email),
        owner_profile:user_profiles!documents_owner_id_fkey(id, full_name, email)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateDocument(id: string, documentData: UpdateDocumentData): Promise<Document> {
    // İzolasyon: Sadece kendi belgesini güncelleyebilir
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    const { data, error } = await supabase
      .from('documents')
      .update(documentData)
      .eq('id', id)
      .eq('owner_id', user.id) // İzolasyon
      .select(`
        *,
        template:document_templates(id, name, type),
        created_by_profile:user_profiles!documents_created_by_fkey(id, full_name, email),
        owner_profile:user_profiles!documents_owner_id_fkey(id, full_name, email)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteDocument(id: string): Promise<{ message: string }> {
    // İzolasyon: Sadece kendi belgesini silebilir
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id); // İzolasyon

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Document deleted successfully' };
  }

  // Template CRUD Operations
  async getTemplates(filters: TemplateFilters = {}): Promise<TemplateResponse> {
    const {
      page = 1,
      limit = 10,
      type,
      department,
      is_default,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = filters;

    let query = supabase
      .from('document_templates')
      .select('*', { count: 'exact' });

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (department) {
      query = query.eq('department', department);
    }

    if (is_default !== undefined) {
      query = query.eq('is_default', is_default);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
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

    return {
      templates: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async getTemplate(id: string): Promise<DocumentTemplate> {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async createTemplate(templateData: CreateTemplateData): Promise<DocumentTemplate> {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Upload file to storage
    const fileExt = templateData.file.name.split('.').pop();
    const fileName = `templates/${templateData.type}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, templateData.file);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    const { data, error } = await supabase
      .from('document_templates')
      .insert({
        name: templateData.name,
        type: templateData.type,
        file_url: publicUrl,
        file_size: templateData.file.size,
        is_default: templateData.is_default || false,
        department: templateData.department,
        created_by: user?.id
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateTemplate(id: string, templateData: UpdateTemplateData): Promise<DocumentTemplate> {
    const { data, error } = await supabase
      .from('document_templates')
      .update(templateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteTemplate(id: string): Promise<{ message: string }> {
    // First get the template to delete the file from storage
    const template = await this.getTemplate(id);
    
    // Delete file from storage
    if (template.file_url) {
      const fileName = template.file_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('documents')
          .remove([`templates/${template.type}/${fileName}`]);
      }
    }

    const { error } = await supabase
      .from('document_templates')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Template deleted successfully' };
  }

  // File Upload Operations
  async uploadDocumentFile(file: File, documentId?: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = documentId 
      ? `documents/${documentId}/${Date.now()}.${fileExt}`
      : `documents/temp/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (error) {
      throw new Error(error.message);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return publicUrl;
  }

  async deleteDocumentFile(fileUrl: string): Promise<void> {
    const fileName = fileUrl.split('/').pop();
    if (fileName) {
      const { error } = await supabase.storage
        .from('documents')
        .remove([fileName]);

      if (error) {
        throw new Error(error.message);
      }
    }
  }

  // Tag Operations
  async getTags(): Promise<DocumentTag[]> {
    const { data, error } = await supabase
      .from('document_tags')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async createTag(name: string, color: string = '#3182CE', description?: string): Promise<DocumentTag> {
    const { data, error } = await supabase
      .from('document_tags')
      .insert({ name, color, description })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteTag(id: string): Promise<{ message: string }> {
    const { error } = await supabase
      .from('document_tags')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Tag deleted successfully' };
  }

  // Version Operations
  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async createDocumentVersion(
    documentId: string, 
    file: File, 
    changesDescription?: string
  ): Promise<DocumentVersion> {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get current version number
    const versions = await this.getDocumentVersions(documentId);
    const nextVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version_number)) + 1 : 1;

    // Upload new version file
    const fileUrl = await this.uploadDocumentFile(file, documentId);

    const { data, error } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: nextVersion,
        file_url: fileUrl,
        file_size: file.size,
        changes_description: changesDescription,
        created_by: user?.id
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Share Operations
  async getDocumentShares(documentId: string): Promise<DocumentShare[]> {
    const { data, error } = await supabase
      .from('document_shares')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async shareDocument(
    documentId: string,
    sharedWith: string,
    permissionLevel: 'view' | 'edit' | 'admin' = 'view',
    expiresAt?: string
  ): Promise<DocumentShare> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('document_shares')
      .insert({
        document_id: documentId,
        shared_with: sharedWith,
        permission_level: permissionLevel,
        shared_by: user?.id,
        expires_at: expiresAt
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async removeDocumentShare(shareId: string): Promise<{ message: string }> {
    const { error } = await supabase
      .from('document_shares')
      .delete()
      .eq('id', shareId);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Document share removed successfully' };
  }

  // Utility Methods
  async getDocumentsByType(type: DocumentType, filters: Omit<DocumentFilters, 'type'> = {}): Promise<DocumentResponse> {
    return this.getDocuments({ ...filters, type });
  }

  async getDocumentsByStatus(status: DocumentStatus, filters: Omit<DocumentFilters, 'status'> = {}): Promise<DocumentResponse> {
    return this.getDocuments({ ...filters, status });
  }

  async getMyDocuments(filters: Omit<DocumentFilters, 'created_by'> = {}): Promise<DocumentResponse> {
    return this.getDocuments({ ...filters, created_by: 'me' });
  }

  async getSharedWithMe(filters: DocumentFilters = {}): Promise<DocumentResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const {
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = filters;

    let query = supabase
      .from('document_shares')
      .select(`
        document:documents(
          *,
          template:document_templates(id, name, type),
          created_by_profile:user_profiles!documents_created_by_fkey(id, full_name, email),
          owner_profile:user_profiles!documents_owner_id_fkey(id, full_name, email)
        )
      `, { count: 'exact' })
      .eq('shared_with', user.id)
      .or('expires_at.is.null,expires_at.gt.now()');

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const documents: Document[] = data?.map((item: any) => item.document).filter(Boolean) as Document[] || [];

    return {
      documents,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    };
  }
}

export const documentsService = new DocumentsService();
export default documentsService;