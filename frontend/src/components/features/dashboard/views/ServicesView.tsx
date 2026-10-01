import { freeServices, serviceGroupOrder } from '../../../../data/services';
import { useLanguage } from '../../../../hooks/useLanguage';
import { ServiceCard } from '../ServiceCard';
import { ViewHeader } from '../DashboardLayout';

export function ServicesView() {
  const { t } = useLanguage();

  return (
    <div className="space-y-10 lg:space-y-12">
      <ViewHeader title={t.dashboard.services.title} subtitle={t.dashboard.services.subtitle} />

      {serviceGroupOrder.map((groupKey, groupIndex) => {
        const items = freeServices.filter((service) => service.group === groupKey);
        if (items.length === 0) return null;
        return (
          <section key={groupKey} aria-labelledby={`services-${groupKey}`}>
            <div className="flex items-baseline gap-3">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-volt">
                {String(groupIndex + 1).padStart(2, '0')}
              </span>
              <h2 id={`services-${groupKey}`} className="font-display text-3xl uppercase leading-none">
                {t.dashboard.services.sections[groupKey]}
              </h2>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
