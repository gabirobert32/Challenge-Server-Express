const express = require('express')
const axios = require('axios')

const app = express()
const PORT = 4000

const author = {
 name: 'Gabriel',
 lastname: 'Robert',
}

app.get('/api/items', async (req, res) => {
 try {
  const query = req.query.q
  const response = await axios.get(
   `https://api.mercadolibre.com/sites/MLA/search?q=${query}`
  )

  const items = response.data.results.map((item) => ({
   id: item.id,
   title: item.title,
   price: {
    currency: item.currency_id,
    amount: Math.floor(item.price),
    decimals: parseFloat((item.price % 1).toFixed(2)),
   },
   picture: item.thumbnail,
   condition: item.condition,
   free_shipping: item.shipping.free_shipping,
  }))

  const categoryFilter = response.data.available_filters.find(
   (filter) => filter.id === 'category'
  )
  const categories = categoryFilter
   ? categoryFilter.values.map((value) => value.name)
   : []

  res.json({
   author,
   categories,
   items,
  })
 } catch (error) {
  console.error('Error fetching data from MercadoLibre API:', error)
  res.status(500).send('Error fetching data from external API.')
 }
})

app.get('/api/items/:id', async (req, res) => {
 const itemId = req.params.id
 try {
  const itemResponse = await axios.get(
   `https://api.mercadolibre.com/items/${itemId}`
  )
  const descriptionResponse = await axios.get(
   `https://api.mercadolibre.com/items/${itemId}/description`
  )

  const itemData = itemResponse.data
  const descriptionData = descriptionResponse.data

  const item = {
   id: itemData.id,
   title: itemData.title,
   price: {
    currency: itemData.currency_id,
    amount: Math.floor(itemData.price),
    decimals: parseFloat((itemData.price % 1).toFixed(2)),
   },
   picture: itemData.thumbnail,
   condition: itemData.condition,
   free_shipping: itemData.shipping.free_shipping,
   sold_quantity: itemData.sold_quantity,
   description: descriptionData.plain_text,
  }

  res.json({
   author,
   item,
  })
 } catch (error) {
  console.error('Error fetching item details from MercadoLibre API:', error)
  res.status(500).send('Error fetching data from external API.')
 }
})

app.listen(PORT, () => {
 console.log(`Server is running on http://localhost:${PORT}`)
})
