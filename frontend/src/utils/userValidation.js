const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[1-9]{2}(?:[2-5]\d{7}|9\d{8})$/;

export function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

export function isValidCpf(value) {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calculateDigit = length => {
    let sum = 0;

    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }

    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10]);
}

export function validateRegistrationForm(data) {
  const errors = {};
  const name = data.name.trim();
  const email = data.email.trim();
  const phone = onlyDigits(data.phone);
  const cpf = onlyDigits(data.cpf);

  if (name.length < 3 || name.length > 100) {
    errors.name = "O nome deve possuir entre 3 e 100 caracteres.";
  }

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    errors.email = "Informe um email válido.";
  }

  if (phone.length !== 10 && phone.length !== 11) {
    errors.phone = "O telefone deve possuir 10 ou 11 dígitos, incluindo o DDD.";
  } else if (!PHONE_PATTERN.test(phone)) {
    errors.phone = "Informe um telefone brasileiro válido, incluindo o DDD.";
  }

  if (cpf.length !== 11) {
    errors.cpf = "O CPF deve possuir 11 dígitos.";
  } else if (!isValidCpf(cpf)) {
    errors.cpf = "Informe um CPF válido.";
  }

  if (data.password.length < 6) {
    errors.password = "A senha deve possuir pelo menos 6 caracteres.";
  } else if (new TextEncoder().encode(data.password).length > 72) {
    errors.password = "A senha deve possuir no máximo 72 bytes.";
  }

  if (data.password !== data.confirm) {
    errors.confirm = "As senhas não conferem.";
  }

  return errors;
}
