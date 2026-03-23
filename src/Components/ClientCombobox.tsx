import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { Client } from "../Interfaces/Client";

type ClientComboboxProps = {
  label: string;
  clients: Client[];
  value: string;
  onChange: (clientId: string) => void;
  placeholder?: string;
  onAddNew?: () => void;
  disabled?: boolean;
};

function getClientLabel(client: Client) {
  return `${client.firstName} ${client.lastName}`.trim();
}

export default function ClientCombobox({
  label,
  clients,
  value,
  onChange,
  placeholder = "Zoek een klant…",
  onAddNew,
  disabled,
}: ClientComboboxProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = useMemo(
    () => `client-combobox-listbox-${Math.random().toString(16).slice(2)}`,
    [],
  );

  const selectedClient = useMemo(() => {
    if (!value) return undefined;
    return clients.find((client) => String(client.id) === String(value));
  }, [clients, value]);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setQuery(selectedClient ? getClientLabel(selectedClient) : "");
    }
  }, [isOpen, selectedClient]);

  const filteredClients = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return clients;

    return clients.filter((client) => {
      const haystack = `${getClientLabel(client)} ${client.email ?? ""} ${
        client.city ?? ""
      }`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [clients, query]);

  const totalItems = filteredClients.length + (onAddNew ? 1 : 0);

  function closeAndRestore() {
    setIsOpen(false);
    setActiveIndex(0);
    setQuery(selectedClient ? getClientLabel(selectedClient) : "");
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (!wrapperRef.current?.contains(target)) {
        closeAndRestore();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient]);

  function selectClient(client: Client) {
    onChange(String(client.id));
    setQuery(getClientLabel(client));
    setIsOpen(false);
    setActiveIndex(0);
    inputRef.current?.blur();
  }

  function handleClear() {
    onChange("");
    setQuery("");
    setIsOpen(false);
    setActiveIndex(0);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => Math.min(prev + 1, Math.max(totalItems - 1, 0)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      if (!isOpen) return;
      event.preventDefault();

      const isAddNewItem = onAddNew ? activeIndex === filteredClients.length : false;
      if (isAddNewItem) {
        onAddNew?.();
        closeAndRestore();
        return;
      }

      const client = filteredClients[activeIndex];
      if (client) selectClient(client);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeAndRestore();
    }
  }

  return (
    <div className="form-group client-combobox-wrapper" ref={wrapperRef}>
      <label>{label}</label>

      <div
        className={`client-combobox ${disabled ? "client-combobox--disabled" : ""}`}
      >
        <input
          ref={inputRef}
          className="client-combobox__input"
          type="text"
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          role="combobox"
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            setIsOpen(true);
            setActiveIndex(0);
            if (value) {
              onChange("");
            }
          }}
        />

        {(value || query) && !disabled ? (
          <button
            type="button"
            className="client-combobox__clear"
            onClick={handleClear}
            aria-label="Selectie wissen"
            title="Wissen"
          >
            ×
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div className="client-combobox__menu" id={listboxId} role="listbox">
          {filteredClients.length === 0 ? (
            <div className="client-combobox__empty">Geen klanten gevonden</div>
          ) : (
            filteredClients.map((client, index) => {
              const idString = String(client.id);
              const isSelected = idString === String(value);
              const isActive = index === activeIndex;

              return (
                <button
                  key={client.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`client-combobox__option ${
                    isActive ? "client-combobox__option--active" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectClient(client)}
                >
                  <span className="client-combobox__option-main">
                    {getClientLabel(client)}
                  </span>
                  <span className="client-combobox__option-meta">
                    {client.email}
                  </span>
                </button>
              );
            })
          )}

          {onAddNew ? (
            <button
              type="button"
              className={`client-combobox__option client-combobox__option--action ${
                activeIndex === filteredClients.length
                  ? "client-combobox__option--active"
                  : ""
              }`}
              onMouseEnter={() => setActiveIndex(filteredClients.length)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onAddNew();
                closeAndRestore();
              }}
            >
              + Nieuwe klant toevoegen
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
