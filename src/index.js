const path = require("path")
const express = require("express")
const Builder = require("selenium-webdriver").Builder
const By = require("selenium-webdriver").By
const until = require("selenium-webdriver").until

const app = express()

app.get("/", async (req, res) => {
    const CPF = req.query.cpf
    const birthday = req.query.birthday

    if(!CPF || !birthday){
        res.status(403).send({ message: "Por favor, forneça o CPF e a data de nascimento"})
        return
    }
    let driver = new Builder().forBrowser("chrome").build()
    try {
        await driver.get("https://www.detran.mg.gov.br/habilitacao/cnh-e-permissao-para-dirigir/acompanhar-entrega-cnh")
        driver.wait(until.titleIs("DETRAN - MG - Acompanhar Entrega de CNH"), 2000);
        await driver.findElement(By.xpath(`//*[@class="cpf"]`)).sendKeys(CPF)
        await driver.findElement(By.xpath(`//*[@class="data obrigatorio"]`)).sendKeys(birthday)
        await driver.findElement(By.xpath(`//*[@class="uma_coluna"]/button`)).click()
        const msg = await driver.findElement(By.id("flashMessage")).getText()
        res.status(404).send({message: "Erro: CNH não disponível. Entre em contato com o DETRAN"})
    } catch (error) {
        if (error.name == "NoSuchElementError") {
            try {
                driver.wait(until.titleIs("DETRAN - MG - Acompanhar Entrega de CNH"), 2000);
                const code = await driver.findElement(By.xpath(`//*[@class="sem_coluna"]//p[2]`)).getText()
                res.send(code.split(" ")[2])
            } catch (error) {
                res.send(error)
            }
        }
    } finally {
        driver.quit()
    }
})

const PORT = process.env.PORT || 8000

app.listen(PORT, null, () => {
    console.log("Server listening on port", PORT)
})