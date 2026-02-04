import { Metadata } from 'next';
import { getPublicDesignById } from '@/services/designs';

interface Props {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const response = await getPublicDesignById(id);
    if (response.success && response.data) {
      const design = response.data;
      const title = design.title || 'Untitled Design';
      
      // Construct a meaningful description
      const screenCount = design.artboards?.length || 0;
      const description = `Check out "${title}", a mobile app design with ${screenCount} screen${screenCount !== 1 ? 's' : ''} created with Butterfast AI.`;

      return {
        title: `${title} - Butterfast Preview`,
        description: description,
        openGraph: {
          title: `${title} - Butterfast Preview`,
          description: description,
          type: 'article', // Using article to represent a specific creation
        },
        twitter: {
          card: 'summary_large_image',
          title: `${title} - Butterfast Preview`,
          description: description,
        }
      };
    }
  } catch (error) {
    // Fail silently for metadata
  }

  return {
    title: 'Design Preview - Butterfast',
    description: 'Preview stunning mobile app designs created with Butterfast AI.',
  };
}

export default function PreviewLayout({
  children,
}: Props) {
  return <>{children}</>;
}
