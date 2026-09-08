'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '../i18n/navigation';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();

    function changeLanguage(newLocale: 'en' | 'es') {
        router.replace(pathname, {
            locale: newLocale
        });
    }

    return (
        <div className='flex gap-2'>
            <Button
                variant={'outline'}
                onClick={() => changeLanguage('en')}
                disabled={locale === 'en'}
            >
                English
            </Button>

            <Button
                variant={'outline'}
                onClick={() => changeLanguage('es')}
                disabled={locale === 'es'}
            >
                Español
            </Button>
        </div>
    );
}