import { freeServices, serviceGroupOrder } from '../../../../data/services';
import { useLanguage } from '../../../../hooks/useLanguage';
import { ServiceCard } from '../ServiceCard';
import { ViewHeader } from '../DashboardLayout';

export function ServicesView() {
  const { t } = useLanguage();

  return (
    <div className="min-w-0">
      <ViewHeader title={t.dashboard.services.title} subtitle={t.dashboard.services.subtitle} />

      {serviceGroupOrder.map((groupKey, groupIndex) => {
        const items = freeServices.filter((service) => service.group === groupKey);
        if (items.length === 0) return null;
        return (
          <section key={groupKey} aria-labelledby={`services-${groupKey}`} className="mt-10 sm:mt-12">
            <div className="mb-6 flex min-w-0 items-baseline gap-3 sm:mb-8 sm:gap-4">
              <span className="shrink-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-volt">
                {String(groupIndex + 1).padStart(2, '0')}
              </span>
              <h2 id={`services-${groupKey}`} className="min-w-0 font-display text-3xl uppercase leading-none tracking-tight sm:text-4xl">
                {t.dashboard.services.sections[groupKey]}
              </h2>
            </div>
            <div className="grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((service) => (
                <ServiceCard key={service.key} service={service} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
