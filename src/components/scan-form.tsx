
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Search } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  url: z.string()
    .min(1, { message: "Please enter a URL." })
    .refine((value) => {
        try {
            const url = new URL(value);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            // Allow for cases where user doesn't type protocol
            if (!/^(http|https):\/\//.test(value)) {
                try {
                    const url = new URL(`http://${value}`);
                    return true; // We'll fix it on the server, just validate the host part is ok
                } catch (e) {
                    return false;
                }
            }
            return false;
        }
    }, {
        message: "Please enter a valid URL (e.g., example.com)."
    })
});

export function ScanForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    let submissionUrl = values.url;
    if (!/^(http|https):\/\//.test(submissionUrl)) {
        submissionUrl = `http://${submissionUrl}`;
    }
    const encodedUrl = encodeURIComponent(submissionUrl);
    router.push(`/scan?url=${encodedUrl}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-2">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Input placeholder="example.com" {...field} aria-label="Website URL" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto min-w-[120px]">
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" /> Scan
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
