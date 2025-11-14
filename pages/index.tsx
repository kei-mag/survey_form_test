import Head from 'next/head';
import type { GetStaticProps } from 'next';
import styles from '@/styles/Home.module.css';
import { FormRenderer } from '@/components/FormRenderer';
import type { FormConfig } from '@/lib/formConfig';
import { loadFormConfig, resolveConfigPath } from '@/lib/formConfig';

type HomeProps = {
  config: FormConfig;
};

export default function Home({ config }: HomeProps) {
  return (
    <>
      <Head>
        <title>{config.name}</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>{config.name}</h1>
          <FormRenderer config={config} />
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const configPath = resolveConfigPath();
  const config = await loadFormConfig(configPath);

  return {
    props: {
      config
    }
  };
};
