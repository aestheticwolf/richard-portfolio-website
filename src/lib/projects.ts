
import { supabase } from './supabase'

export type PortfolioProject = {
  id: string
  slug: string
  number: string
  name: string
  category: string
  summary: string
  description: string
  imageUrl: string
  galleryImages: string[]
  stack: string[]
  color: string
  github: string
  liveUrl: string
  demoVideo: string
  features: string[]
}

type SupabaseProject = {
  id: string
  slug: string
  title: string
  category: string
  short_description: string
  description: string
  tech_stack: string[]
  live_url: string | null
  github_url: string | null
image_url: string | null
gallery_images: string[] | null
features: string[] | null
  demo_video_url: string | null
  sort_order: number
}

const projectColors = [
  'from-violet-500/20 to-blue-500/5',
  'from-blue-500/20 to-cyan-500/5',
  'from-indigo-500/20 to-violet-500/5',
  'from-fuchsia-500/15 to-purple-500/5',
]

function mapProject(
  project: SupabaseProject,
  index: number,
): PortfolioProject {
  return {
    id: project.id,
    slug: project.slug,
    number: String(index + 1).padStart(2, '0'),
    name: project.title,
    category: project.category,
    summary: project.short_description || project.description,
    description: project.description || project.short_description,
    imageUrl: project.image_url ?? '',
    galleryImages: project.gallery_images ?? [],
    stack: project.tech_stack ?? [],
    color: projectColors[index % projectColors.length],
    github: project.github_url ?? '',
    liveUrl: project.live_url ?? '',
    demoVideo: project.demo_video_url ?? '',
    features: project.features ?? [],
  }
}

export async function getPublishedProjects(): Promise<PortfolioProject[]> {
  const { data, error } = await supabase
    .from('projects')
   .select(
  'id, slug, title, category, short_description, description, tech_stack, live_url, github_url, image_url, gallery_images, features, demo_video_url, sort_order',
)
    .eq('status', 'published')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Could not load published projects: ${error.message}`)
  }

  return ((data ?? []) as SupabaseProject[]).map(mapProject)
}
