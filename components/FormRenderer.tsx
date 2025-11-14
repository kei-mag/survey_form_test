import { useId } from 'react';
import styles from '@/styles/Form.module.css';
import type { FormConfig, FormItem } from '@/lib/formConfig';

interface FormRendererProps {
  config: FormConfig;
}

export function FormRenderer({ config }: FormRendererProps) {
  return (
    <form className={styles.form}>
      {config.contents.map((item, index) => (
        <FormSection key={`${item.type}-${index}`} item={item} index={index} />
      ))}
    </form>
  );
}

interface FormSectionProps {
  item: FormItem;
  index: number;
}

function FormSection({ item, index }: FormSectionProps) {
  const baseId = useId();
  const titleId = `${baseId}-title`;

  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle} id={titleId}>
          {item.title}
        </h2>
        {item.description && <p className={styles.sectionDescription}>{item.description}</p>}
      </header>
      <div className={styles.sectionBody}>{renderField(item, baseId, index, titleId)}</div>
    </section>
  );
}

function renderField(item: FormItem, baseId: string, index: number, titleId: string) {
  switch (item.type) {
    case 'oneline-text':
      return (
        <input
          className={styles.input}
          type="text"
          id={`${baseId}-${index}`}
          name={`field-${index}`}
          aria-labelledby={titleId}
          pattern={item.validationRegex}
        />
      );
    case 'multiline-text':
      return (
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          id={`${baseId}-${index}`}
          name={`field-${index}`}
          aria-labelledby={titleId}
          rows={4}
        />
      );
    case 'radio':
      return (
        <fieldset className={styles.fieldset} aria-labelledby={titleId}>
          {item.choices.map((choice, choiceIndex) => {
            const choiceId = `${baseId}-${index}-${choiceIndex}`;
            return (
              <label className={styles.choiceLabel} htmlFor={choiceId} key={choiceId}>
                <input
                  className={styles.choiceInput}
                  type="radio"
                  id={choiceId}
                  name={`field-${index}`}
                  value={choice}
                />
                <span>{choice}</span>
              </label>
            );
          })}
        </fieldset>
      );
    case 'checkbox':
      return (
        <fieldset className={styles.fieldset} aria-labelledby={titleId}>
          {item.choices.map((choice, choiceIndex) => {
            const choiceId = `${baseId}-${index}-${choiceIndex}`;
            return (
              <label className={styles.choiceLabel} htmlFor={choiceId} key={choiceId}>
                <input
                  className={styles.choiceInput}
                  type="checkbox"
                  id={choiceId}
                  name={`field-${index}`}
                  value={choice}
                />
                <span>{choice}</span>
              </label>
            );
          })}
        </fieldset>
      );
    case 'pulldown':
      return (
        <select
          className={styles.input}
          id={`${baseId}-${index}`}
          name={`field-${index}`}
          aria-labelledby={titleId}
          defaultValue=""
        >
          <option value="" disabled>
            選択してください
          </option>
          {item.choices.map((choice) => (
            <option value={choice} key={choice}>
              {choice}
            </option>
          ))}
        </select>
      );
    case 'file':
      return (
        <div className={styles.fileInputWrapper}>
          <input
            className={styles.input}
            type="file"
            id={`${baseId}-${index}`}
            name={`field-${index}`}
            aria-labelledby={titleId}
            accept={item.fileExt}
          />
          {(item.fileExt || item.maxFileSize) && (
            <p className={styles.fileHelp}>
              {item.fileExt && <span>許可される拡張子: {item.fileExt}</span>}
              {item.fileExt && item.maxFileSize && <span> / </span>}
              {item.maxFileSize && <span>最大サイズ: {item.maxFileSize}</span>}
            </p>
          )}
        </div>
      );
    default:
      return null;
  }
}

export default FormRenderer;
