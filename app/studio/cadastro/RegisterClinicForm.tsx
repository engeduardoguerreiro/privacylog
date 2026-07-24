"use client";

import { useActionState, useState } from "react";
import { Check, Lock, Mail, MapPin, MessageCircle, Store } from "lucide-react";
import { getPurchasablePlans, formatBRL } from "@/lib/billing/plans";
import { registerClinic, type RegisterState } from "./actions";
import styles from "@/app/login/auth.module.css";

const initialState: RegisterState = {};

export default function RegisterClinicForm() {
  const plans = getPurchasablePlans();
  const [state, action, pending] = useActionState(registerClinic, initialState);
  const [plan, setPlan] = useState(plans[0]?.slug ?? "essential");

  return (
    <form className={styles.form} action={action}>
      <p className={styles.label}>Dados da casa</p>

      <label className={styles.field}>
        <span className={styles.label}>Nome da casa</span>
        <span className={styles.inputWrap}>
          <Store size={18} />
          <input
            name="clinic_name"
            required
            placeholder="Maison Aurora"
            className={styles.input}
          />
        </span>
      </label>

      <div className={styles.inlineFields}>
        <label className={styles.field}>
          <span className={styles.label}>Cidade</span>
          <span className={styles.inputWrap}>
            <MapPin size={18} />
            <input name="city" required placeholder="Sao Paulo" className={styles.input} />
          </span>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Estado</span>
          <span className={styles.inputWrap}>
            <input
              name="state"
              required
              maxLength={2}
              placeholder="SP"
              className={styles.input}
              style={{ textTransform: "uppercase" }}
            />
          </span>
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>WhatsApp</span>
        <span className={styles.inputWrap}>
          <MessageCircle size={18} />
          <input
            name="whatsapp"
            required
            placeholder="5511999999999"
            className={styles.input}
          />
        </span>
      </label>

      <p className={styles.label} style={{ marginTop: 18 }}>
        Acesso
      </p>

      <label className={styles.field}>
        <span className={styles.label}>E-mail</span>
        <span className={styles.inputWrap}>
          <Mail size={18} />
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="voce@email.com"
            className={styles.input}
          />
        </span>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Senha</span>
        <span className={styles.inputWrap}>
          <Lock size={18} />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Minimo 6 caracteres"
            className={styles.input}
          />
        </span>
      </label>

      <p className={styles.label} style={{ marginTop: 18 }}>
        Escolha o plano
      </p>

      <input type="hidden" name="plan" value={plan} />
      <div className={styles.planPicker}>
        {plans.map((option) => {
          const active = plan === option.slug;

          return (
            <button
              type="button"
              key={option.slug}
              onClick={() => setPlan(option.slug)}
              className={`${styles.planOption} ${active ? styles.planOptionActive : ""}`}
              aria-pressed={active}
            >
              <span className={styles.planOptionHead}>
                <strong>{option.name}</strong>
                {active ? <Check size={16} /> : null}
              </span>
              <span className={styles.planOptionPrice}>
                {formatBRL(option.amount)}
                <small>/mês</small>
              </span>
            </button>
          );
        })}
      </div>

      {state.error ? (
        <div className={`${styles.alert} ${styles.alertError}`}>{state.error}</div>
      ) : null}

      {state.message ? (
        <div className={`${styles.alert} ${styles.alertOk}`}>{state.message}</div>
      ) : null}

      <button type="submit" disabled={pending} className={styles.submit}>
        {pending ? "Processando..." : "Criar conta e ir para o pagamento"}
      </button>

      <p className={styles.hint}>
        No próximo passo você conclui a assinatura mensal pelo Mercado Pago. A
        página da casa entra no ar assim que o pagamento é confirmado.
      </p>
    </form>
  );
}
