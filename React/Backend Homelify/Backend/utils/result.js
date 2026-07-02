function createResult(error, data) {
  if (error) {
    return {
      status: 'error',
      error: error
    }
  }

  return {
    status: 'success',
    data: data
  }
}

module.exports = { createResult }
